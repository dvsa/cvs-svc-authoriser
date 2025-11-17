import { APIGatewayAuthorizerResult, Statement } from "aws-lambda";
import newPolicyDocument from "./newPolicyDocument";
import StatementBuilder from "../services/StatementBuilder";
import { HttpVerb } from "../services/http-verbs";
import { Jwt, JwtPayload } from "jsonwebtoken";
import { APIGatewayRequestAuthorizerEvent } from "aws-lambda/trigger/api-gateway-authorizer";

export function generateMediaPolicy(jwt: Jwt, event: APIGatewayRequestAuthorizerEvent): APIGatewayAuthorizerResult | undefined {
  const { methodArn, headers, httpMethod } = event;

  // If you're not looking at the media path, return undefined which will then resume normal role checks
  if (!methodArn.includes("cvs-media")) {
    return undefined;
  }

  // Only PUT requests need to be authenticated against user ID
  if (httpMethod !== "PUT") {
    return undefined;
  }

  const payload = jwt.payload as JwtPayload;

  // In dev, we don't have a guarantee for employeeid, so we fall back to oid
  const userID = payload.employeeId || payload.employeeid || payload.oid;

  if (userID !== headers?.["x-amz-meta-user-id"]) {
    throw new Error("User ID in token does not match User ID in request headers");
  }

  const statements: Statement[] = [
    {
      verb: "GET",
      path: "*",
    },
    {
      verb: "PUT",
      path: "*",
    },
  ]
    .map((i) =>
      new StatementBuilder()
        .setEffect("Allow")
        .setHttpVerb(i.verb as HttpVerb)
        .setResource(i.path)
        .build()
    )
    .flat();

  return {
    principalId: jwt.payload.sub as string,
    policyDocument: newPolicyDocument(statements),
  };
}
