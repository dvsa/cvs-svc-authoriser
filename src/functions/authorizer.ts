import { APIGatewayTokenAuthorizerEvent, Context, Statement } from "aws-lambda";
import StatementBuilder from "../services/StatementBuilder";
import { APIGatewayAuthorizerResult } from "aws-lambda/trigger/api-gateway-authorizer";
import { generatePolicy as generateRolePolicy } from "./rolePolicyFactory";
import { generatePolicy as generateFunctionalPolicy } from "./functionalPolicyFactory";
import { getValidJwt } from "../services/tokens";
import { JWT_MESSAGE } from "../models/enums";
import { ILogEvent } from "../models/ILogEvent";
import { writeLogMessage } from "../common/Logger";
import newPolicyDocument from "./newPolicyDocument";
import { Jwt, JwtPayload } from "jsonwebtoken";

/**
 * Lambda custom authorizer function to verify whether a JWT has been provided
 * and to verify its integrity and validity.
 * @param event - AWS Lambda event object
 * @param context - AWS Lambda Context object
 * @returns - Promise<APIGatewayAuthorizerResult>
 */
export const authorizer = async (event: APIGatewayTokenAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  const logEvent: ILogEvent = {};

  if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID) {
    writeLogMessage(logEvent, event.authorizationToken, JWT_MESSAGE.INVALID_ID_SETUP);
    return unauthorisedPolicy();
  }

  try {
    initialiseLogEvent(event);
    const jwt = await getValidJwt(event.authorizationToken, logEvent, process.env.AZURE_TENANT_ID, process.env.AZURE_CLIENT_ID);

    const policy = generateRolePolicy(jwt, logEvent) ?? generateFunctionalPolicy(jwt, logEvent);

    if (policy !== undefined) {
      return policy;
    }

    reportNoValidRoles(jwt, event, context, logEvent);
    writeLogMessage(logEvent, event.authorizationToken, JWT_MESSAGE.INVALID_ROLES);
    return unauthorisedPolicy();
  } catch (error: any) {
    writeLogMessage(logEvent, event.authorizationToken, error);
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

const reportNoValidRoles = (jwt: Jwt, event: APIGatewayTokenAuthorizerEvent, context: Context, logEvent: ILogEvent): void => {
  const roles = (jwt.payload as JwtPayload).roles;
  if (roles && roles.length === 0) {
    logEvent.message = JWT_MESSAGE.NO_ROLES;
  } else {
    logEvent.message = JWT_MESSAGE.INVALID_ROLES;
  }
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
