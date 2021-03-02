import {APIGatewayTokenAuthorizerEvent, Context, PolicyDocument, Statement} from "aws-lambda";
import StatementBuilder from "../services/StatementBuilder";
import {APIGatewayAuthorizerResult} from "aws-lambda/trigger/api-gateway-authorizer";
import {checkSignature} from "../services/signature-check";
import Role, {getValidRoles} from "../services/roles";
import {getValidJwt} from "../services/tokens";
import {configuration, AuthorizerConfig, getAssociatedResources} from "../services/configuration";
import {availableHttpVerbs, isSafe} from "../services/http-verbs";

/**
 * Lambda custom authorizer function to verify whether a JWT has been provided
 * and to verify its integrity and validity.
 * @param event - AWS Lambda event object
 * @param context - AWS Lambda Context object
 * @returns - Promise<Policy | undefined>
 */
export const authorizer = async (event: APIGatewayTokenAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  try {
    // fail-fast if config is missing or invalid
    const config: AuthorizerConfig = await configuration();

    const jwt = getValidJwt(event.authorizationToken);

    const validRoles = getValidRoles(jwt);

    if (validRoles.length === 0) {
      console.error('no valid roles on token')
      dumpArguments(event, context);
      return unauthorisedPolicy();
    }

    await checkSignature(jwt);

    let statements: Statement[] = [];

    for (const role of validRoles) {
      const items = roleToStatements(role, config);
      statements = statements.concat(items);
    }

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

const roleToStatements = (role: Role, config: AuthorizerConfig): Statement[] => {
  const associatedResources: string[] = getAssociatedResources(role, config);

  const statements: Statement[] = [];

  for (const associatedResource of associatedResources) {
    const parts = associatedResource.substring(1).split('/');
    const resource = parts[0];

    let childResource = null;

    if (parts.length > 1) {
      childResource = parts.slice(1).join('/');
    }

    if (role.access === 'read') {
      for (const httpVerb of availableHttpVerbs()) {
        if (isSafe(httpVerb)) {
          statements.push(new StatementBuilder()
            .setEffect('Allow')
            .setHttpVerb(httpVerb)
            .setResource(resource)
            .setChildResource(childResource)
            .build()
          );
        }
      }
    } else {
      statements.push(new StatementBuilder()
        .setEffect('Allow')
        .setHttpVerb('*')
        .setResource(resource)
        .setChildResource(childResource)
        .build()
      );
    }
  }

  return statements;
}

const unauthorisedPolicy = (): APIGatewayAuthorizerResult => {
  const statements: Statement[] = [
    new StatementBuilder()
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
