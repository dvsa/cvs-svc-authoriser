import { ILogEvent } from "../models/ILogEvent";
import { JWT_MESSAGE } from "../models/enums";
import { ILogError } from "../models/ILogError";
import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";

export const writeLogMessage = (event: APIGatewayTokenAuthorizerEvent, log: ILogEvent, error?: any) => {
  if (!error) {
    log.statusCode = 200;
    console.log(log);
  } else {
    const logError: ILogError = {};
    log.statusCode = 401;

    // If the DEBUG_MODE env var is set to true, log the token - only applicable when errors occur
    log.token = process.env.DEBUG_MODE === "true" ? event.authorizationToken : undefined;

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
  }
  return log;
};

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export const envLogger = (level: LogLevel, ...messages: string[]) => {
  if (process.env.DEBUG === "true" || process.env.DEBUG === "log") {
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(messages);
        break;
      case LogLevel.INFO:
        console.info(messages);
        break;
      case LogLevel.WARN:
        console.warn(messages);
        break;
      case LogLevel.ERROR:
        console.error(messages);
        break;
      default:
        console.log(messages);
        return;
    }
  }
};
