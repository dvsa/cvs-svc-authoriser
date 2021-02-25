import SecretsManager, {GetSecretValueRequest} from "aws-sdk/clients/secretsmanager";
import {getSecret} from "../../src/services/secrets";

describe('getSecret()', (): void => {
  it('should return SecretString if secret exists', async (): Promise<void> => {
    setUpMockSecret('secretIngredient', 'UnicornDust');

    await expect(getSecret('secretIngredient')).resolves.toEqual('UnicornDust');
  });

  it('should reject if secret does not exist', async (): Promise<void> => {
    setUpMockSecret('knownIngredient', 'pumpkinSpice');

    await expect(getSecret('secretIngredient')).rejects.toThrowError();
  });

  const setUpMockSecret = (secretId: string, secretValue: string) => {
    SecretsManager.prototype.getSecretValue = jest.fn().mockImplementation(
      (request: GetSecretValueRequest) => ({
        promise: () => {
          if (request.SecretId === secretId) {
            return { SecretString: secretValue };
          }
          return { SecretString: '' }
        }
      })
    );
  }
});
