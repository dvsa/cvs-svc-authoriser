import {safeLoad} from "js-yaml";
import Role from "./roles";
import * as fs from "fs";
import {getEnvVar} from "./env-utils";


export interface AuthorizerConfig {
  roleToResources: ResourceMapping[]
}

export interface ResourceMapping {
  roleName: string;
  associatedResources: string[];
}

export const configuration = async (): Promise<AuthorizerConfig> => {
  let configPath: string = getEnvVar('CONFIG_FILE_PATH', 'src/resources/config.yml');

  // see https://docs.aws.amazon.com/lambda/latest/dg/configuration-envvars.html
  if (process.env.LAMBDA_TASK_ROOT) {
    configPath = `${process.env.LAMBDA_TASK_ROOT}/${configPath}`;
  }

  const configYml: string = fs.readFileSync(configPath, 'utf-8');

  const config = safeLoad(configYml) as AuthorizerConfig;

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
