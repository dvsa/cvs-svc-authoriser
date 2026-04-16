import type { CustomAuthorizerResult } from "aws-lambda";

export const createAuthResult = (effect: "Allow" | "Deny", resource: string): CustomAuthorizerResult => {
  return {
    principalId: "N/A",
    policyDocument: {
      Version: "2012-10-17", // default version
      Statement: [
        {
          Action: "execute-api:Invoke", // default action
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
