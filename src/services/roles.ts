import { Jwt, JwtPayload } from "jsonwebtoken";
import { ILogEvent } from "../models/ILogEvent";

export type Access = "read" | "write" | "view";

function isOfTypeAccess(access: Access): boolean {
  return ["read", "write", "view"].includes(access);
}

export default interface Role {
  name: string;
  access: Access;
}

const backwardsCompatibleRoleNames = ["CVSFullAccess", "CVSPsvTester", "CVSHgvTester", "CVSAdrTester", "CVSTirTester", "VTMAdmin"];

export const getLegacyRoles = (token: Jwt, logEvent: ILogEvent): Role[] => {
  const rolesOnToken = (token.payload as JwtPayload).roles;

  if (!rolesOnToken) {
    logEvent.roles = [];
    return [];
  }

  const validRoles = [];

  logEvent.roles = rolesOnToken;

  for (const role of rolesOnToken) {
    // old role - definitely valid (for now)
    if (backwardsCompatibleRoleNames.includes(role)) {
      validRoles.push(newRole(role, "write"));
      continue; // < this may need to be removed in future if backwards-compatible role access differs across roles
    }

    // new role - check basic formatting
    const parts = role.split(".");

    if (parts.length !== 2) {
      continue;
    }

    const [name, access] = parts;

    if (!name || !access) {
      continue;
    }

    if (isOfTypeAccess(access.toLowerCase())) {
      validRoles.push(newRole(name, access.toLowerCase()));
    }
  }

  return validRoles;
};

const newRole = (name: string, access: Access): Role => {
  return {
    name,
    access,
  };
};
