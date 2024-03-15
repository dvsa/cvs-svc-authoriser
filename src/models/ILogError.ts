import Role from "../services/roles";
export interface ILogError {
  name?: string;
  message?: string;
  username?: string;
  roles?: Role[];
}
