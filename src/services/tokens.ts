import * as JWT from "jsonwebtoken";
import { JWT_MESSAGE } from "../models/enums";
import { logEvent } from "../functions/authorizer";

export const getValidJwt = (authorizationToken: string): any => {
  checkFormat(authorizationToken);

  authorizationToken = authorizationToken.substring(7); // remove 'Bearer '
  logEvent.token = authorizationToken;

  const decoded: any = JWT.decode(authorizationToken, { complete: true });

  if (!decoded) {
    throw new Error(JWT_MESSAGE.DECODE_FAILED);
  }

  let username;

  if (decoded.payload.unique_name) {
    username = decoded.payload.unique_name;
  } else if (decoded.payload.preferred_username) {
    username = decoded.payload.preferred_username;
  } else {
    username = "No data available in token";
  }

  logEvent.email = username;
  logEvent.tokenExpiry = new Date(decoded.payload.exp * 1000).toISOString();
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
