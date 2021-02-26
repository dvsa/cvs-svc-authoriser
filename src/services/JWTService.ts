import * as JWT from "jsonwebtoken";
import AuthorizationError from "../models/exceptions/AuthorizationError";
import {ALLOWEDROLES, ERRORMESSAGES} from "../assets/enum";
import AuthorizerConfig from "../models/AuthorizerConfig";
import {getCertificateChain} from "./azure";

class JWTService {

  /**
   * Verify the token
   * @param token
   * @param config
   */
  public async verify(token: string, config: AuthorizerConfig): Promise<string | object> {
    const decodedToken: any = JWT.decode(token, {complete: true});

    // Check if config is valid
    if (!config || !config.azure || !config.azure.tennant || !config.azure.appId || !config.azure.issuer || !config.azure.jwk_endpoint) {
      throw new AuthorizationError(ERRORMESSAGES.AZURE_CONFIGURATION_NOT_VALID);
    }

    if (!this.isAtLeastOneRoleValid(decodedToken)) {
      throw new AuthorizationError("Invalid roles");
    }

    const endpoint = config.azure.jwk_endpoint.replace(":tennant", config.azure.tennant);

    const issuer = config.azure.issuer.replace(":tennant", config.azure.tennant);

    const certificate = await getCertificateChain(endpoint, decodedToken.header.kid);

    return JWT.verify(token, certificate, {audience: decodedToken.payload.aud, issuer, algorithms: ["RS256"]});
  }

  /**
   * Internal function used to determine if the user has a valid role. Not directly exposed
   * @param decodedToken
   */
  public isAtLeastOneRoleValid(decodedToken: any): boolean {
    let isAtLeastOneRoleValid = false;
    const allowedRoles = [ALLOWEDROLES.CVSFullAccess, ALLOWEDROLES.CVSPsvTester, ALLOWEDROLES.CVSHgvTester, ALLOWEDROLES.CVSAdrTester, ALLOWEDROLES.CVSTirTester, ALLOWEDROLES.CVSVTMAdmin];
    const rolesOnToken = decodedToken.payload.roles;
    if (!rolesOnToken) {
      return false;
    }
    allowedRoles.forEach((allowedRole) => {
      if (rolesOnToken.includes(allowedRole)) {
        isAtLeastOneRoleValid = true;
      }
    });
    return isAtLeastOneRoleValid;
  }
}

export {JWTService};
