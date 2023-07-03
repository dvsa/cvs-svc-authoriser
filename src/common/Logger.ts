import { ILogEvent } from "../models/ILogEvent";
import { JWT_MESSAGE } from "../models/enums";
import { ILogError } from "../models/ILogError";

export const writeLogMessage = (log: ILogEvent, jwt: string, error?: any) => {
  if (!error) {
    log.statusCode = 200;
    console.log(log);
  } else {
    const logError: ILogError = {};
    log.statusCode = 401;
    if (!error.name) {
      logError.message = error as string;
    } else {
      switch (error.name) {
        case "TokenExpiredError":
          logError.name = "TokenExpiredError";
          logError.message = `${JWT_MESSAGE.EXPIRED} ${error.message} at ${error.expiredAt}`;
          break;
        case "NotBeforeError":
          logError.name = "NotBeforeError";
          logError.message = `${JWT_MESSAGE.NOT_BEFORE} ${error.message} until ${error.date}`;
          break;
        case "JsonWebTokenError":
          logError.name = "JsonWebTokenError";
          logError.message = `${JWT_MESSAGE.ERROR} ${error.message}`;
          break;
        default:
          logError.name = error.name;
          logError.message = error.message;
          break;
      }
    }
    log.error = logError;
    console.error(log);
    console.log(jwt);
  }
  return log;
};
