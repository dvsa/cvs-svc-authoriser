import { APIGatewayAuthorizerResult, Statement } from "aws-lambda";
import newPolicyDocument from "./newPolicyDocument";
import { ILogEvent } from "../models/ILogEvent";
import { HttpVerb, toHttpVerb } from "../services/http-verbs";

type NonEmptyArray<T> = [T, ...T[]];

interface IApiAccess{
  verb:HttpVerb,
  path:string
}

const roleConfig:{[key:string]:NonEmptyArray<IApiAccess>} = {
  "createTechRecord":[
    {
      verb:"POST",
      path:"vehicles/*"
    }
  ]
}

export function generatePolicy(jwt: any, logEvent:ILogEvent): APIGatewayAuthorizerResult | PromiseLike<APIGatewayAuthorizerResult> {
    const statements: Statement[] = [];

    return {
      principalId: jwt.payload.sub,
      policyDocument: newPolicyDocument(statements),
    };
  }