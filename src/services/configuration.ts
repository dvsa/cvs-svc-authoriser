import {safeLoad} from "js-yaml";
import AuthorizerConfig from "../models/AuthorizerConfig";
import {getSecret} from "./secrets";
import AuthorizationError from "../models/exceptions/AuthorizationError";
import {AZURE_CONFIGURATION_NOT_VALID} from "../models/exceptions/errors";

export default async function configuration(): Promise<AuthorizerConfig> {
  if (!process.env.SECRET_NAME) {
    throw new Error("SECRET_NAME environment variable not set!");
  }

  const secretValue = await getSecret(process.env.SECRET_NAME as string);

  const config: AuthorizerConfig = safeLoad(secretValue as string) as AuthorizerConfig;

  validate(config);

  return config;
}

const validate = (config: AuthorizerConfig): void => {
  if (!config || !config.azure || !config.azure.tennant || !config.azure.appId || !config.azure.issuer || !config.azure.jwk_endpoint) {
    throw new AuthorizationError(AZURE_CONFIGURATION_NOT_VALID);
  }
}
