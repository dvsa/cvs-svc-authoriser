import {safeLoad} from "js-yaml";
import IConfig from "../models/IConfig";
import {getSecret} from "./secrets";

export default async function configuration(): Promise<IConfig> {
  if (process.env.SECRET_NAME) {
    const secretValue = await getSecret(process.env.SECRET_NAME as string);
    return safeLoad(secretValue as string) as IConfig;
  } else {
    throw new Error("SECRET_NAME environment variable not set!");
  }
}
