import {AuthorizerConfig, configuration} from "../../../src/services/configuration";

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

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV }; // (clone)
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('should successfully return configuration if it\'s valid', async (): Promise<void> => {
    process.env.CONFIG_FILE_PATH = 'tests/resources/config-test.yml';
    await expect(configuration()).resolves.toStrictEqual(mockConfig);
  });

  it('should fail if configuration object is null', async (): Promise<void> => {
    process.env.CONFIG_FILE_PATH = 'tests/resources/config-blank.yml';
    await expect(configuration()).rejects.toThrowError('configuration is null or blank');
  });

  it('should fail if configuration.roleToResources is null', async (): Promise<void> => {
    process.env.CONFIG_FILE_PATH = 'tests/resources/config-no-roles.yml';
    await expect(configuration()).rejects.toThrowError('missing required field');
  });
});
