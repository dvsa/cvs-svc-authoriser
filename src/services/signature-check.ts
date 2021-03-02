import * as JWT from "jsonwebtoken";
import {getCertificateChain} from "./azure";

export const checkSignature = async (token: any): Promise<string | object> => {
  const tenantId = token.payload.tid;
  const issuer = token.payload.iss;
  const certificate = await getCertificateChain(tenantId, token.header.kid);

  return JWT.verify(
    token,
    certificate,
    {
      audience: token.payload.aud,
      issuer,
      algorithms: [ "RS256" ]
    }
  );
}
