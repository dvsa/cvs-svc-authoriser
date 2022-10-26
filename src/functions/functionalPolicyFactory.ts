import { APIGatewayAuthorizerResult, Statement } from "aws-lambda";
import newPolicyDocument from "./newPolicyDocument";
import { ILogEvent } from "../models/ILogEvent";
import StatementBuilder from "../services/StatementBuilder";
import { functionConfig, IApiAccess } from "./functionalConfig";
import { Jwt, JwtPayload } from "jsonwebtoken";

function toStatements(access: IApiAccess): Statement[] {
  return access.verbs.map((v) => new StatementBuilder().setEffect("Allow").setHttpVerb(v).setResource(access.path).build());
}

export function generatePolicy(jwt: Jwt, logEvent: ILogEvent): APIGatewayAuthorizerResult | undefined {
  const statements = (jwt.payload as JwtPayload).roles
    .map((r: string) => functionConfig[r])
    .filter((i: IApiAccess[]) => i !== undefined)
    .map((i: IApiAccess[]) => i.map((ia) => toStatements(ia)).flat())
    .flat();

  if (statements.length === 0) {
    return undefined;
  }

  const returnValue = {
    principalId: jwt.payload.sub as string,
    policyDocument: newPolicyDocument(statements),
  };

  return returnValue;
}
