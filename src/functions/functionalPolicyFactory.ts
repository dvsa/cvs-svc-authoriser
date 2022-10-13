import { APIGatewayAuthorizerResult, Statement } from "aws-lambda";
import newPolicyDocument from "./newPolicyDocument";
import { ILogEvent } from "../models/ILogEvent";
import { HttpVerb } from "../services/http-verbs";
import StatementBuilder from "../services/StatementBuilder";

type NonEmptyArray<T> = [T, ...T[]];

interface IApiAccess {
  verb: HttpVerb;
  path: string;
}

const functionConfig: { [key: string]: NonEmptyArray<IApiAccess> } = {
  "TechRecord.Amend": [
    {
      verb: "POST",
      path: "vehicles/*",
    },
    {
      verb: "PUT",
      path: "vehicles/*",
    },
  ],
  "TechRecord.View": [
    {
      verb: "GET",
      path: "vehicles/*",
    },
  ],
  "TestResult.Amend": [
    {
      verb: "POST",
      path: "test-result/*",
    },
    {
      verb: "PUT",
      path: "test-result/*",
    },
    {
      verb: "GET",
      path: "test-types/*",
    },
    {
      verb: "GET",
      path: "test-stations/*",
    },
    {
      verb: "GET",
      path: "defects/*",
    },
    {
      verb: "GET",
      path: "reference/*",
    },
  ],
  "TestResult.View": [
    {
      verb: "GET",
      path: "test-result/*",
    },
    {
      verb: "GET",
      path: "test-types/*",
    },
    {
      verb: "GET",
      path: "v1/document-retrieval/*",
    },
};

function toStatement(access: IApiAccess): Statement {
  return new StatementBuilder().setEffect("Allow").setHttpVerb(access.verb).setResource(access.path).build();
}

export function generatePolicy(jwt: any, logEvent: ILogEvent): APIGatewayAuthorizerResult | undefined {
  const statementSets = jwt.payload.roles
    .map((r: string) => functionConfig[r])
    .filter((i: IApiAccess[]) => i !== undefined)
    .map((i: IApiAccess[]) => i.map((ia) => toStatement(ia)));
  const statements = [].concat.apply([], statementSets);

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
