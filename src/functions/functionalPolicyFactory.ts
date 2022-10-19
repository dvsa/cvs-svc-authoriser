import { APIGatewayAuthorizerResult, Statement } from "aws-lambda";
import newPolicyDocument from "./newPolicyDocument";
import { ILogEvent } from "../models/ILogEvent";
import StatementBuilder from "../services/StatementBuilder";
import { functionConfig, IApiAccess } from "./functionalConfig";

function toStatements(access: IApiAccess): Statement[] {
  return access.verbs.map(v => new StatementBuilder().setEffect("Allow").setHttpVerb(v).setResource(access.path).build());
}

export function generatePolicy(jwt: any, logEvent: ILogEvent): APIGatewayAuthorizerResult | undefined {
  const statements = jwt.payload.roles
    .map((r: string) => functionConfig[r])
    .filter((i: IApiAccess[]) => i !== undefined)
    .map((i: IApiAccess[]) => i.map((ia) => toStatements(ia)).flat()).flat();

  if (statements.length === 0) {
    return undefined;
  }

  const returnValue = {
    principalId: jwt.payload.sub,
    policyDocument: newPolicyDocument(statements),
  };

  console.log("POLICY:" + JSON.stringify(returnValue));
  return returnValue;
}
