import { decode, Jwt } from "jsonwebtoken";
import { JWT_MESSAGE } from "../models/enums";
import { checkSignature } from "./signature-check";

export const getValidJwt = async (authorizationToken: string, tenantId: string, clientId: string): Promise<Jwt> => {
  checkFormat(authorizationToken);

  authorizationToken = authorizationToken.substring(7); // remove 'Bearer '

  const decoded: Jwt | null = decode(authorizationToken, { complete: true });

  if (!decoded) {
    throw new Error(JWT_MESSAGE.DECODE_FAILED);
  }

  await checkSignature(authorizationToken, decoded, tenantId, clientId);

  return decoded;
};

const checkFormat = (authorizationToken: string) => {
  if (!authorizationToken) {
    throw new Error(JWT_MESSAGE.NO_AUTH_HEADER);
  }

  const [bearerPrefix, token] = authorizationToken.split(" ");

  if ("Bearer" !== bearerPrefix) {
    throw new Error(JWT_MESSAGE.NO_BEARER_PREFIX);
  }

  if (!token || !token.trim()) {
    throw new Error(JWT_MESSAGE.BLANK_TOKEN);
  }
};
