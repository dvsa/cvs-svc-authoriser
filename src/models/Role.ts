import {Access} from "../services/roles";

export default interface Role {
  name: string,
  access: Access
}
