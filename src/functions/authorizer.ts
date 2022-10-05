import { APIGatewayTokenAuthorizerEvent, Context, Statement } from "aws-lambda";
import StatementBuilder from "../services/StatementBuilder";
import { APIGatewayAuthorizerResult } from "aws-lambda/trigger/api-gateway-authorizer";
import { generatePolicy as generateLegacyPolicy } from "./legacyPolicyFactory";
import { generatePolicy as generateRolePolicy } from "./rolePolicyFactory";
import Role, { getLegacyRoles } from "../services/roles";
import { getValidJwt } from "../services/tokens";
import { JWT_MESSAGE } from "../models/enums";
import { ILogEvent } from "../models/ILogEvent";
import { writeLogMessage } from "../common/Logger";
import newPolicyDocument from "./newPolicyDocument";

/**
 * Lambda custom authorizer function to verify whether a JWT has been provided
 * and to verify its integrity and validity.
 * @param event - AWS Lambda event object
 * @param context - AWS Lambda Context object
 * @returns - Promise<APIGatewayAuthorizerResult>
 */
export const authorizer = async (event: APIGatewayTokenAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  const logEvent: ILogEvent = {};
  try {
    initialiseLogEvent(event);
    const jwt: any = getValidJwt(event.authorizationToken, logEvent);

    const legacyRoles: Role[] = getLegacyRoles(jwt, logEvent);

    if (legacyRoles && legacyRoles.length > 0) {
      return generateLegacyPolicy(jwt, legacyRoles);
    }

    const roleBasedPolicy = await generateRolePolicy(jwt, logEvent);

    if (roleBasedPolicy) {
      return roleBasedPolicy;
    }

    reportNoValidRoles(jwt, event, context, logEvent);
    writeLogMessage(logEvent, JWT_MESSAGE.INVALID_ROLES);
    return unauthorisedPolicy();
  } catch (error: any) {
    writeLogMessage(logEvent, error);
    dumpArguments(event, context);
    return unauthorisedPolicy();
  }
};

const unauthorisedPolicy = (): APIGatewayAuthorizerResult => {
  const statements: Statement[] = [new StatementBuilder().setEffect("Deny").build()];

  return {
    principalId: "Unauthorised",
    policyDocument: newPolicyDocument(statements),
  };
};

const reportNoValidRoles = (jwt: any, event: APIGatewayTokenAuthorizerEvent, context: Context, logEvent: ILogEvent): void => {
  const roles = jwt.payload.roles;
  if (roles && roles.length === 0) {
    logEvent.message = JWT_MESSAGE.NO_ROLES;
  } else {
    logEvent.message = JWT_MESSAGE.INVALID_ROLES;
  }
  dumpArguments(event, context);
};

const dumpArguments = (event: APIGatewayTokenAuthorizerEvent, context: Context): void => {
  console.error("Event dump  : ", JSON.stringify(event));
  console.error("Context dump: ", JSON.stringify(context));
};

/**
 * This method is being used in order to clear the ILogEvent, ILogError objects and populate the request url and the time of request
 * @param event
 */
const initialiseLogEvent = (event: APIGatewayTokenAuthorizerEvent): ILogEvent => {
  return {
    requestUrl: event.methodArn,
    timeOfRequest: new Date().toISOString(),
  } as ILogEvent;
};
