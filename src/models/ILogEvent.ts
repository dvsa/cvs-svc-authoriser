import { ILogError } from "./ILogError";

export interface ILogEvent {
  requestUrl?: string;
  timeOfRequest?: string;
  statusCode?: number;
  email?: string;
  tokenExpiry?: string;
  message?: string;
  error?: ILogError;
  /**
   * This is a sensitive field and should only be logged when the DEBUG_MODE env var is set to true
   */
  token?: string;
}
