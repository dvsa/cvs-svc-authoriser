import { decode, Jwt, JwtPayload, verify } from "jsonwebtoken";
import { JWT_MESSAGE } from "../models/enums";
import { ILogEvent } from "../models/ILogEvent";
import { checkSignature } from "./signature-check";

interface CVSJWTPayload extends JwtPayload {
  unique_name: string;
  preferred_username: string;
}

export const getValidJwt = async (authorizationToken: string, logEvent: ILogEvent, tenantId: string, clientId: string): Promise<Jwt> => {
  console.log('Checking token format ...');
  checkFormat(authorizationToken);

  authorizationToken = authorizationToken.substring(7); // remove 'Bearer '

  console.log('Decoding token ...');
  const decoded: Jwt | null = decode(authorizationToken, { complete: true });

  if (!decoded) {
    console.log('No decoded token - throwing error ...');
    throw new Error(JWT_MESSAGE.DECODE_FAILED);
  }

  let username;

  console.log('Decoding payload ...');
  const payload = decoded.payload as CVSJWTPayload;

  if (!payload) {
    console.log('No payload - setting username to default ...');
    username = "No data available in token";
  } else {
    if (payload.preferred_username) {
      console.log('Using preferred username ...');
      username = payload.preferred_username;
    } else {
      console.log('Using unique name ...');
      username = payload.unique_name;
    }
  }

  logEvent.email = username;
  logEvent.roles = (decoded.payload as JwtPayload).roles;
  logEvent.tokenExpiry = new Date((payload.exp as number) * 1000).toISOString();

  console.log('Checking signature ...');
  await checkSignature(authorizationToken, decoded, tenantId, clientId);

  return decoded;
};

const checkFormat = (authorizationToken: string) => {
  if (!authorizationToken) {
    console.log('No authorisation token - throwing error ...');
    throw new Error(JWT_MESSAGE.NO_AUTH_HEADER);
  }

  const [bearerPrefix, token] = authorizationToken.split(" ");

  if ("Bearer" !== bearerPrefix) {
    console.log('No bearer prefix - throwing error ...');
    throw new Error(JWT_MESSAGE.NO_BEARER_PREFIX);
  }

  if (!token || !token.trim()) {
    console.log('No token - throwing error ...');
    throw new Error(JWT_MESSAGE.BLANK_TOKEN);
  }
};
