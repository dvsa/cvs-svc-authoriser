import { APIGatewayAuthorizerResult, Statement } from "aws-lambda";
import newPolicyDocument from "./newPolicyDocument";
import { ILogEvent } from "../models/ILogEvent";

export function generatePolicy(jwt: any, logEvent:ILogEvent): APIGatewayAuthorizerResult | PromiseLike<APIGatewayAuthorizerResult> {
    let statements: Statement[] = [];

    return {
      principalId: jwt.payload.sub,
      policyDocument: newPolicyDocument(statements),
    };
  }