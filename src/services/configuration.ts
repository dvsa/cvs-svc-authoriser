import {safeLoad} from "js-yaml";
import AuthorizerConfig from "../models/AuthorizerConfig";
import {getSecret} from "./secrets";

export default async function configuration(): Promise<AuthorizerConfig> {
  if (process.env.SECRET_NAME) {
    const secretValue = await getSecret(process.env.SECRET_NAME as string);
    return safeLoad(secretValue as string) as AuthorizerConfig;
  } else {
    throw new Error("SECRET_NAME environment variable not set!");
  }
}
