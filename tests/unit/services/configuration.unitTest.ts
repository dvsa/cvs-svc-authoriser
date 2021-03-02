import {safeDump} from "js-yaml";
import SecretsManager from "aws-sdk/clients/secretsmanager";
import {configuration, AuthorizerConfig} from "../../../src/services/configuration";
import * as fs from "fs";

describe("configuration()", () => {
  const OLD_ENV = process.env;

  const mockConfig: AuthorizerConfig = {
    roleToResources: [
      {
        roleName: 'a-role',
        associatedResources: [
          '/a-resource/with-child'
        ]
      }
    ]
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
      setUpSecret(fs.readFileSync('tests/resources/fakeConfig.yml', 'utf-8'));
      await expect(configuration()).resolves.toStrictEqual(mockConfig);
    });

    it('should fail if AWS throws error', async (): Promise<void> => {
      SecretsManager.prototype.getSecretValue = jest.fn().mockImplementationOnce(
        () => ({
          promise: () => {
            throw new Error('fake AWS error')
          }
        })
      );

      await expect(configuration()).rejects.toThrowError('fake AWS error');
    });

    it('should fail if configuration object is null', async (): Promise<void> => {
      setUpSecret('');
      await expect(configuration()).rejects.toThrowError('configuration is null or blank');
    });

    it('should fail if roleToResources is null', async (): Promise<void> => {
      const config = {
        ...mockConfig,
        roleToResources: null
      };
      setUpSecret(safeDump(config));
      await expect(configuration()).rejects.toThrowError('missing required field');
    });
  });

  const setUpSecret = (secretString: string): void => {
    SecretsManager.prototype.getSecretValue = jest.fn().mockImplementation(
      () => ({
        promise: () => ({SecretString: secretString})
      })
    );
  }
});
