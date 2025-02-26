import Role from "../services/roles";
import { ILogError } from "./ILogError";
import { HttpStatus } from "@dvsa/cvs-microservice-common/api/http-status-codes";

export interface ILogEvent {
  requestUrl?: string;
  timeOfRequest?: string;
  statusCode?: HttpStatus;
  email?: string;
  tokenExpiry?: string;
  roles?: Role[];
  message?: string;
  error?: ILogError;
  /**
   * This is a sensitive field and should only be logged when the DEBUG_MODE env var is set to true
   */
  token?: string;
}
