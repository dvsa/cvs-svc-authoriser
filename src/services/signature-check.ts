import * as JWT from "jsonwebtoken";
import { getCertificateChain } from "./azure";
import { envLogger, LogLevel } from "../common/Logger";

export const checkSignature = async (encodedToken: string, decodedToken: JWT.Jwt, tenantId: string, clientId: string): Promise<void> => {
  // tid = tenant ID, kid = key ID
  envLogger(LogLevel.DEBUG, "Getting cert chain");
  const certificate = await getCertificateChain(tenantId, decodedToken.header.kid as string);

  envLogger(LogLevel.INFO, "Verifying token");
  JWT.verify(encodedToken, certificate, {
    audience: clientId.split(","),
    issuer: [`https://sts.windows.net/${tenantId}/`, `https://login.microsoftonline.com/${tenantId}/v2.0`],
    algorithms: ["RS256"],
  });
};
