import { APIGatewayAuthorizerResult, Statement } from "aws-lambda";
import newPolicyDocument from "./newPolicyDocument";
import { ILogEvent } from "../models/ILogEvent";
import { HttpVerb, toHttpVerb } from "../services/http-verbs";

type NonEmptyArray<T> = [T, ...T[]];

interface IApiAccess {
  verb: HttpVerb;
  path: string;
}

const functionConfig: { [key: string]: NonEmptyArray<IApiAccess> } = {
  createTechRecord: [
    {
      verb: "POST",
      path: "vehicles/*",
    },
  ],
};

export function generatePolicy(jwt: any, logEvent: ILogEvent): APIGatewayAuthorizerResult | PromiseLike<APIGatewayAuthorizerResult> | null {
  const statements: Statement[] = [];

  if (statements.length === 0) {
    return null;
  }

  return {
    principalId: jwt.payload.sub,
    policyDocument: newPolicyDocument(statements),
  };
}
