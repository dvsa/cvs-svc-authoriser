import { APIGatewayTokenAuthorizerEvent, Context } from "aws-lambda";
import authorizer from "../../../src/functions/authorizer";
import { getValidJwt } from "../../../src/services/tokens";

jest.mock("../../../src/services/tokens", () => {
  return { getValidJwt: jest.fn() };
});

const event: APIGatewayTokenAuthorizerEvent = {
  type: "TOKEN",
  authorizationToken: "Bearer myBearerToken",
  methodArn: "arn:aws:execute-api:eu-west-1:123456789012:apiId/stage/GET/resource",
};

describe("authorizer()", () => {
  beforeEach(() => {
    process.env.AZURE_TENANT_ID = "tenant";
    process.env.AZURE_CLIENT_ID = "client";
    jest.spyOn(console, "error").mockImplementation(jest.fn());
    (getValidJwt as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    delete process.env.AZURE_TENANT_ID;
    delete process.env.AZURE_CLIENT_ID;
  });

  it("allows all verbs and resources when the token is valid", async () => {
    const returnValue = await authorizer(event, exampleContext());

    expect(getValidJwt).toHaveBeenCalledWith("Bearer myBearerToken", "tenant", "client");
    expect(returnValue).toEqual({
      principalId: "N/A",
      policyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Action: "execute-api:Invoke",
            Resource: "arn:aws:execute-api:eu-west-1:123456789012:apiId/stage/*/*",
          },
        ],
      },
    });
  });

  it("denies all verbs and resources when Azure configuration is missing", async () => {
    delete process.env.AZURE_TENANT_ID;

    const returnValue = await authorizer(event, exampleContext());

    expect(getValidJwt).not.toHaveBeenCalled();
    expect(returnValue.policyDocument.Statement).toEqual([
      {
        Effect: "Deny",
        Action: "execute-api:Invoke",
        Resource: "arn:aws:execute-api:eu-west-1:123456789012:apiId/stage/*/*",
      },
    ]);
  });

  it("denies all verbs and resources when JWT validation fails", async () => {
    (getValidJwt as jest.Mock).mockRejectedValue(new Error("test-signature-error"));

    const returnValue = await authorizer(event, exampleContext());

    expect(returnValue.policyDocument.Statement).toEqual([
      {
        Effect: "Deny",
        Action: "execute-api:Invoke",
        Resource: "arn:aws:execute-api:eu-west-1:123456789012:apiId/stage/*/*",
      },
    ]);
  });
});

const exampleContext = (): Context => {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "test",
    functionVersion: "0.0.0",
    invokedFunctionArn: "arn:aws:execute-api:eu-west-1:TEST",
    memoryLimitInMB: "128",
    awsRequestId: "TEST-AWS-REQUEST-ID",
    logGroupName: "TEST-LOG-GROUP-NAME",
    logStreamName: "TEST-LOG-STREAM-NAME",
    getRemainingTimeInMillis: (): number => 86400000,
    done: (): void => {
      return undefined;
    },
    fail: (): void => {
      return undefined;
    },
    succeed: (): void => {
      return undefined;
    },
  };
};
