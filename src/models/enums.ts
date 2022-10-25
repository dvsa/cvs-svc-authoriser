export enum JWT_MESSAGE {
  NO_AUTH_HEADER = "[JWT-ERROR-01] no caller-supplied-token (no authorization header on original request)",
  NO_BEARER_PREFIX = "[JWT-ERROR-02] caller-supplied-token must start with Bearer (case-sensitive)",
  BLANK_TOKEN = "[JWT-ERROR-03] Bearer prefix present, but token is blank or missing",
  DECODE_FAILED = "[JWT-ERROR-04] JWT.decode failed, input is likely not a JWT",
  NO_ROLES = "[JWT-ERROR-05] no valid roles on token (token has no roles at all)",
  INVALID_ROLES = "[JWT-ERROR-06] no valid roles on token",
  EXPIRED = "[JWT-ERROR-07]",
  NOT_BEFORE = "[JWT-ERROR-08]",
  ERROR = "[JWT-ERROR-09]",
  INVALID_ID_SETUP = "[JWT-ERROR-10] No tenant or client ID set",
}
