import * as JWT from "jsonwebtoken";
import { getCertificateChain } from "./azure";

export const checkSignature = async (encodedToken: string, decodedToken: any, tenantId:string, clientId:string): Promise<void> => {
  // tid = tenant ID, kid = key ID
  const certificate = await getCertificateChain(tenantId, decodedToken.header.kid);

  JWT.verify(encodedToken, certificate, {
    audience: clientId,
    issuer: `https://sts.windows.net/${tenantId}/`,
    algorithms: ["RS256"],
  });
};
