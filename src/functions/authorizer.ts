import {APIGatewayTokenAuthorizerEvent, Context, PolicyDocument, Statement} from "aws-lambda";
import StatementBuilder from "../services/StatementBuilder";
import {APIGatewayAuthorizerResult} from "aws-lambda/trigger/api-gateway-authorizer";
import {checkSignature} from "../services/signature-check";
import {getValidRoles} from "../services/roles";
import {getValidJwt} from "../services/tokens";

/**
 * Lambda custom authoriser function to verify whether a JWT has been provided
 * and to verify its integrity and validity.
 * @param event - AWS Lambda event object
 * @param context - AWS Lambda Context object
 * @returns - Promise<Policy | undefined>
 */
export const authorizer = async (event: APIGatewayTokenAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  try {
    const jwt = getValidJwt(event.authorizationToken);

    const validRoles = getValidRoles(jwt);

    if (validRoles.length === 0) {
      console.error('no valid roles on token')
      dumpArguments(event, context);
      return unauthorisedPolicy();
    }

    await checkSignature(jwt);

    // TODO at this point, roles are guaranteed valid (signature checked). Now, take the roles and make a policy from them.

    const statements: Statement[] = [
      new StatementBuilder()
        .setEffect('Allow')
        .build()
    ];

    return {
      principalId: jwt.payload.sub,
      policyDocument: newPolicyDocument(statements)
    }
  } catch (error: any) {
    console.error(error.message);
    dumpArguments(event, context);

    return unauthorisedPolicy();
  }
};

const unauthorisedPolicy = (): APIGatewayAuthorizerResult => {
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

const newPolicyDocument = (statements: Statement[]): PolicyDocument => {
  return {
    Version: '2012-10-17',
    Statement: statements
  }
}

const dumpArguments = (event: APIGatewayTokenAuthorizerEvent, context: Context): void => {
  console.error('Event dump  : ', JSON.stringify(event));
  console.error('Context dump: ', JSON.stringify(context));
}
