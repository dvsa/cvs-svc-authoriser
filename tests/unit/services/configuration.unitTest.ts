import {AuthorizerConfig, configuration, validate} from "../../../src/services/configuration";

describe("configuration()", () => {
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

  it('should successfully return any default configuration', (): void => {
    expect(configuration()).resolves.toBeDefined();
  });

  it('should successfully validate configuration if it\'s valid', (): void => {
    expect(validate(mockConfig)).toEqual(mockConfig);
  });

  it('should fail if configuration object is null', (): void => {
    // @ts-ignore
    expect((): void => validate(null)).toThrowError('configuration is null or blank');
  });

  it('should fail if configuration.roleToResources is null', (): void => {
    // @ts-ignore
    expect((): void => validate({})).toThrowError('missing required field');
  });
});
