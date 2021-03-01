import * as JWT from "jsonwebtoken";
import AuthorizerConfig from "../models/AuthorizerConfig";
import {getCertificateChain} from "./azure";
import configuration from "./configuration";

export const checkSignature = async (token: any): Promise<string | object> => {
  const config: AuthorizerConfig = await configuration();

  const endpoint = config.azure.jwk_endpoint.replace(":tennant", config.azure.tennant);
  const issuer = config.azure.issuer.replace(":tennant", config.azure.tennant);
  const certificate = await getCertificateChain(endpoint, token.header.kid);

  return JWT.verify(token, certificate, {audience: token.payload.aud, issuer, algorithms: ["RS256"]});
}
