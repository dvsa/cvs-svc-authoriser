import {safeLoad} from "js-yaml";
import IConfig from "./IConfig";
import {getSecret} from "../services/secrets";

export default async function getConfig(): Promise<IConfig> {
  if (process.env.SECRET_NAME) {
    const secretValue = await getSecret(process.env.SECRET_NAME as string);
    return safeLoad(secretValue as string) as IConfig;
  } else {
    throw new Error("SECRET_NAME environment variable not set!");
  }
}
