import * as JWT from "jsonwebtoken";
import {getCertificateChain} from "./azure";

export const checkSignature = async (token: any): Promise<void> => {
  // tid = tenant ID
  const certificate = await getCertificateChain(token.payload.tid, token.header.kid);

  JWT.verify(
    token,
    certificate,
    {
      audience: token.payload.aud,
      issuer: token.payload.iss,
      algorithms: [ "RS256" ]
    }
  );
}
