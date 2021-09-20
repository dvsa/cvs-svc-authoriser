import Role from "../services/roles";
import { ILogError } from "./ILogError";

export interface ILogEvent {
  requestUrl?: string;
  timeOfRequest?: string;
  statusCode?: number;
  email?: string;
  token?: string;
  tokenExpiry?: string;
  roles?: Role[];
  message?: string;
  error?: ILogError;
}
