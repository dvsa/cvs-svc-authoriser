import { APIGatewayAuthorizerResult, MaybeStatementResource, Statement, StatementResource } from "aws-lambda";
import newPolicyDocument from "./newPolicyDocument";
import { ILogEvent } from "../models/ILogEvent";
import StatementBuilder from "../services/StatementBuilder";
import { functionConfig, IApiAccess } from "./functionalConfig";
import { Jwt, JwtPayload } from "jsonwebtoken";
import { ResourceStatement } from "aws-sdk/clients/ec2";

function toStatements(access: IApiAccess): Statement[] {
  return access.verbs.map((v) => new StatementBuilder().setEffect("Allow").setHttpVerb(v).setResource(access.path).build());
}

export function generatePolicy(jwt: Jwt, logEvent: ILogEvent): APIGatewayAuthorizerResult | undefined {
  const statements = (jwt.payload as JwtPayload).roles
    .map((r: string) => functionConfig[r])
    .filter((i: IApiAccess[]) => i !== undefined)
    .map((i: IApiAccess[]) => i.map((ia) => toStatements(ia)).flat())
    .flat();

  console.log("statments:", JSON.stringify(statements));

  const dedupedFilters = statements.filter((item: MaybeStatementResource, pos: number, self: MaybeStatementResource[]) => {
    return self.findIndex((s) => s.Resource === item.Resource) === pos;
  });

  if (dedupedFilters.length === 0) {
    return undefined;
  }

  const returnValue = {
    principalId: jwt.payload.sub as string,
    policyDocument: newPolicyDocument(dedupedFilters),
  };

  return returnValue;
}
