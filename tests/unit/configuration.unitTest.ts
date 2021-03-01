import {safeDump} from "js-yaml";
import AuthorizerConfig from "../../src/models/AuthorizerConfig";
import SecretsManager from "aws-sdk/clients/secretsmanager";
import configuration from "../../src/services/configuration";
import {AZURE_CONFIGURATION_NOT_VALID} from "../../src/models/exceptions/errors";

describe("configuration()", () => {
  const OLD_ENV = process.env;

  const mockConfig: AuthorizerConfig = {
    azure: {
      tennant: "a UUID v4",
      appId: "a UUID v4",
      issuer: "sts.windows.net",
      jwk_endpoint: "login.microsoft.com"
    }
  };

  beforeAll((): void => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // (clone)
    setUpSecret(safeDump(mockConfig))
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should fail if env.SECRET_NAME is not set', async (): Promise<void> => {
    await expect(configuration()).rejects.toThrowError('SECRET_NAME environment variable not set!');
  });

  context('when env.SECRET_NAME is set', () => {
    beforeEach(() => {
      process.env.SECRET_NAME = 'any';
    });

    it('should successfully return config', async (): Promise<void> => {
      setUpSecret(safeDump(mockConfig));
      await expect(configuration()).resolves.toStrictEqual(mockConfig);
    });

    it('should fail if AWS throws error', async (): Promise<void> => {
      SecretsManager.prototype.getSecretValue = jest.fn().mockImplementationOnce(
        () => ({
          promise: () => { throw new Error('fake AWS error') }
        })
      );

      await expect(configuration()).rejects.toThrowError('fake AWS error');
    });

    it('should fail if configuration object is null', async (): Promise<void> => {
      setUpSecret('');
      await expect(configuration()).rejects.toThrowError(AZURE_CONFIGURATION_NOT_VALID);
    });

    it('should fail if Azure tenant is null', async (): Promise<void> => {
      const config = {
        ...mockConfig,
        azure: {
          tennant: null
        }
      };
      setUpSecret(safeDump(config));
      await expect(configuration()).rejects.toThrowError(AZURE_CONFIGURATION_NOT_VALID);
    });

    it('should fail if Azure appId is null', async (): Promise<void> => {
      const config = {
        ...mockConfig,
        azure: {
          appId: null
        }
      };
      setUpSecret(safeDump(config));
      await expect(configuration()).rejects.toThrowError(AZURE_CONFIGURATION_NOT_VALID);
    });

    it('should fail if Azure issuer is null', async (): Promise<void> => {
      const config = {
        ...mockConfig,
        azure: {
          issuer: null
        }
      };
      setUpSecret(safeDump(config));
      await expect(configuration()).rejects.toThrowError(AZURE_CONFIGURATION_NOT_VALID);
    });

    it('should fail if Azure jwk_endpoint is null', async (): Promise<void> => {
      const config = {
        ...mockConfig,
        azure: {
          jwk_endpoint: null
        }
      };
      setUpSecret(safeDump(config));
      await expect(configuration()).rejects.toThrowError(AZURE_CONFIGURATION_NOT_VALID);
    });
  });

  const setUpSecret = (secretString: string): void => {
    SecretsManager.prototype.getSecretValue = jest.fn().mockImplementation(
      () => ({
        promise: () => ({ SecretString: secretString })
      })
    );
  }
});
