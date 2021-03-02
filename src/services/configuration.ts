import {safeLoad} from "js-yaml";
import {getSecret} from "./secrets";
import Role from "./roles";

export interface AuthorizerConfig {
  roleToResources: ResourceMapping[]
}

export interface ResourceMapping {
  roleName: string;
  associatedResources: string[];
}

export const configuration = async (): Promise<AuthorizerConfig> => {
  if (!process.env.SECRET_NAME) {
    throw new Error("SECRET_NAME environment variable not set!");
  }

  const secretValue = await getSecret(process.env.SECRET_NAME as string);

  const config = safeLoad(secretValue as string) as AuthorizerConfig;

  return validate(config);
}

export const getAssociatedResources = (role: Role, config: AuthorizerConfig): string[] => {
  for (const resourceMapping of config.roleToResources) {
    if (resourceMapping.roleName === role.name) {
      return resourceMapping.associatedResources;
    }
  }

  return [];
}

const validate = (config: AuthorizerConfig): AuthorizerConfig => {
  if (!config) {
    throw new Error('configuration is null or blank');
  }

  if (!config.roleToResources) {
    throw new Error('configuration is missing required field \'roleToResources\'');
  }

  for (const resourceMapping of config.roleToResources) {
    if (!resourceMapping.roleName) {
      throw new Error('resource mapping is missing required field \'roleName\'');
    }

    if (!resourceMapping.associatedResources) {
      throw new Error(`role \'${resourceMapping.roleName}\' is missing required field \'associatedResources\'`);
    }

    if (resourceMapping.associatedResources.length === 0) {
      throw new Error(`role '${resourceMapping.roleName}' must have at least 1 associated resource`);
    }

    for (const associatedResource of resourceMapping.associatedResources) {
      if (!associatedResource || !associatedResource.trim()) {
        throw new Error(`role '${resourceMapping.roleName}' contains null or blank associated resources`);
      }

      if (!associatedResource.startsWith('/')) {
        throw new Error(`role '${resourceMapping.roleName}', resource '${associatedResource}' does not start with '/'`);
      }
    }
  }

  return config;
}
