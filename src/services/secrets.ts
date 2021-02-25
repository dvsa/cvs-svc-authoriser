import * as AWSXRay from "aws-xray-sdk";
import {SecretsManager} from "aws-sdk";
import {GetSecretValueRequest, GetSecretValueResponse} from "aws-sdk/clients/secretsmanager";

let secretsManager: SecretsManager | null = null;

export const getSecret = async (secretId: string): Promise<string> => {
  const request: GetSecretValueRequest = {
    SecretId: secretId
  };

  const response: GetSecretValueResponse = await getSecretsManager().getSecretValue(request).promise();

  if (!response.SecretString || !response.SecretString.trim()) {
    throw new Error(`Secret '${secretId}' is null or blank`);
  }

  return response.SecretString!;
};

const getSecretsManager = (): SecretsManager => {
  if (!secretsManager) {
    secretsManager = AWSXRay.captureAWSClient(new SecretsManager({region: process.env.AWS_REGION || "eu-west-1"}))
  }
  return secretsManager;
}
