import {APIGatewayTokenAuthorizerEvent, Context} from "aws-lambda";
import {StatusCodeError} from "request-promise/errors";
import {authoriser} from "../../src/functions/authoriser";
import {JWTService} from "../../src/services/JWTService";
import {IncomingMessage} from "http";
import AuthorizationError from "../../src/models/exceptions/AuthorizationError";
import {APIGatewayAuthorizerResult} from "aws-lambda/trigger/api-gateway-authorizer";

jest.mock("../../src/utils/configuration");

const event: APIGatewayTokenAuthorizerEvent = {
  type: 'TOKEN',
  authorizationToken: 'Bearer myBearerToken',
  methodArn: 'arn:aws:execute-api:eu-west-1:*:*/*/*/*'
};

describe('authoriser() unit tests', () => {

  it('should fail on blank authorization token', async () => {
    await expectUnauthorised({...event, authorizationToken: ''});
  });

  it('should fail on non-Bearer authorization token', async () => {
    await expectUnauthorised({...event, authorizationToken: 'not a bearer'});
  });

  it('should fail when Bearer prefix is present, but token value isn\'t', async () => {
    await expectUnauthorised({...event, authorizationToken: 'Bearer'});
  });

  it('should fail when Bearer prefix is present, but token value is blank', async () => {
    await expectUnauthorised({...event, authorizationToken: 'Bearer      '});
  });

  it('should fail on invalid JWT token', async () => {
    JWTService.prototype.verify = jest.fn().mockRejectedValue(new Error("invalid token"));

    await expectUnauthorised(event);
  });

  it('should fail on non-2xx HTTP status', async () => {
    JWTService.prototype.verify = jest.fn().mockRejectedValue(
      new StatusCodeError(418, 'I\'m a teapot', { url: 'http://example.org' }, {} as IncomingMessage)
    );

    await expectUnauthorised(event);
  });

  it('should fail on JWT authorization error', async () => {
    JWTService.prototype.verify = jest.fn().mockRejectedValue(
      new AuthorizationError('test-authorization-error')
    );

    await expectUnauthorised(event);
  });

  it('should pass on valid JWT', async () => {
    JWTService.prototype.verify = jest.fn().mockResolvedValue(
      { sub: 'any-authorised' }
    );

    const returnValue: APIGatewayAuthorizerResult = await authoriser(event, exampleContext());

    await expect(returnValue.principalId).toEqual('any-authorised');
    await expect(returnValue.policyDocument.Statement[0].Effect).toEqual('Allow');
  });
});

const expectUnauthorised = async (e: APIGatewayTokenAuthorizerEvent) => {
  await expect(authoriser(e, exampleContext())).resolves.toMatchObject({
    principalId: 'Unauthorised'
  });
};

const exampleContext = (): Context => {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test',
    functionVersion: '0.0.0',
    invokedFunctionArn: 'arn:aws:execute-api:eu-west-1:TEST',
    memoryLimitInMB: '128',
    awsRequestId: 'TEST-AWS-REQUEST-ID',
    logGroupName: 'TEST-LOG-GROUP-NAME',
    logStreamName: 'TEST-LOG-STREAM-NAME',
    getRemainingTimeInMillis: (): number => 86400000,
    done: (): void => { /* circumvent TSLint no-empty */ },
    fail: (): void => { /* circumvent TSLint no-empty */ },
    succeed: (): void => { /* circumvent TSLint no-empty */ },
  };
};
