import {APIGatewayTokenAuthorizerEvent, Context, PolicyDocument, Statement} from "aws-lambda";
import StatementBuilder from "../models/IAM/StatementBuilder";
import {JWTService} from "../services/JWTService";
import {StatusCodeError} from "request-promise/errors";
import IConfig from "../utils/IConfig";
import getConfig from "../utils/GetConfig";
import {APIGatewayAuthorizerResult} from "aws-lambda/trigger/api-gateway-authorizer";

/**
 * Lambda custom authoriser function to verify whether a JWT has been provided
 * and to verify its integrity and validity.
 * @param event - AWS Lambda event object
 * @param context - AWS Lambda Context object
 * @returns - Promise<Policy | undefined>
 */
export const authoriser: any = async (event: APIGatewayTokenAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  const config: IConfig = await getConfig();

  const jwtService = new JWTService();

  try {
    const bearerToken = getBearerToken(event, context);
    // TODO refactor this to just object...
    const jwt: object | string = await jwtService.verify(bearerToken, config);

    const statements: Statement[] = [
      new StatementBuilder()
        .setEffect('Allow')
        .build()
    ];

    return {
      principalId: (jwt as any).sub,
      policyDocument: newPolicyDocument(statements)
    }
  } catch (error: any) {
    if (error instanceof StatusCodeError) {
      console.error(JSON.stringify(error.error));
    } else {
      console.error(error.message);
    }

    const statements: Statement[] = [
      new StatementBuilder()
        .setAction('execute-api:Invoke')
        .setEffect('Deny')
        .build()
    ];

    return {
      principalId: 'Unauthorised',
      policyDocument: newPolicyDocument(statements)
    }
  }
};

const getBearerToken = (event: APIGatewayTokenAuthorizerEvent, context: Context): string => {
  if (!event.authorizationToken) {
    reportFailure(event, context);
    throw new Error('no caller-supplied-token (no authorization header on original request)');
  }

  const [bearerPrefix, token] = event.authorizationToken.split(' ');

  if ('Bearer' !== bearerPrefix) {
    reportFailure(event, context);
    throw new Error('caller-supplied-token must start with \'Bearer \' (case-sensitive)');
  }

  if (!token || !token.trim()) {
    reportFailure(event, context);
    throw new Error('\'Bearer \' prefix present, but token is blank or missing');
  }

  return token;
}

const reportFailure = (event: APIGatewayTokenAuthorizerEvent, context: Context): void => {
  console.error('Event dump:   ', JSON.stringify(event));
  console.error('Context dump: ', JSON.stringify(context));
}

const newPolicyDocument = (statements: Statement[]): PolicyDocument => {
  return {
    Version: '2012-10-17',
    Statement: statements
  }
}
