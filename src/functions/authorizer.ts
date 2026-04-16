import type { APIGatewayTokenAuthorizerEvent, Context } from "aws-lambda";
import type { APIGatewayAuthorizerResult } from "aws-lambda/trigger/api-gateway-authorizer";
import { toAllVerbsAndAllResources } from "./rolePolicyFactory";
import { getValidJwt } from "../services/tokens";
import { JWT_MESSAGE } from "../models/enums";
import type { ILogEvent } from "../models/ILogEvent";
import { envLogger, LogLevel, writeLogMessage } from "../common/Logger";
import { createAuthResult } from "../common/PolicyDoc";

/**
 * Lambda custom authorizer function to verify whether a JWT has been provided
 * and to verify its integrity and validity.
 * @param event - AWS Lambda event object
 * @param _context - AWS Lambda Context object
 * @returns - Promise<APIGatewayAuthorizerResult>
 */
const authorizer = async (event: APIGatewayTokenAuthorizerEvent, _context: Context): Promise<APIGatewayAuthorizerResult> => {
  const logEvent: ILogEvent = {};

  envLogger(LogLevel.DEBUG, "Invoked authoriser");

  const methodArn = toAllVerbsAndAllResources(event.methodArn);

  if (!process.env.AZURE_TENANT_ID || !process.env.AZURE_CLIENT_ID) {
    writeLogMessage(event, logEvent, JWT_MESSAGE.INVALID_ID_SETUP);
    return createAuthResult("Deny", methodArn);
  }

  envLogger(LogLevel.DEBUG, "AZURE_TENANT_ID and AZURE_CLIENT_ID are set");

  try {
    envLogger(LogLevel.INFO, "Getting valid JWT");

    const jwt = await getValidJwt(event.authorizationToken, process.env.AZURE_TENANT_ID, process.env.AZURE_CLIENT_ID);

    envLogger(LogLevel.DEBUG, `JWT retrieved`, JSON.stringify(jwt));

    return createAuthResult("Allow", methodArn);
  } catch (error: any) {
    envLogger(LogLevel.ERROR, "Catch - Error occurred", error);

    writeLogMessage(event, logEvent, error);

    return createAuthResult("Deny", methodArn);
  }
};

export default authorizer;
