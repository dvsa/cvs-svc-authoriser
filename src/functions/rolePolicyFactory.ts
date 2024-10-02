import { APIGatewayAuthorizerResult, Statement } from "aws-lambda";
import { Jwt } from "jsonwebtoken";
import { AccessHttpVerbMap } from "../models/AccessHttpVerbMap";
import { ILogEvent } from "../models/ILogEvent";
import { HttpVerb } from "../services/http-verbs";
import Role, { getLegacyRoles } from "../services/roles";
import StatementBuilder from "../services/StatementBuilder";
import newPolicyDocument from "./newPolicyDocument";

type NonEmptyArray<T> = [T, ...T[]];

const accessToHttpVerbs: AccessHttpVerbMap = {
  read: ["GET", "HEAD"],
  write: ["*"],
};

const Configuration: AuthorizerConfig = {
  CVSFullAccess: ["/*"],
  CVSPsvTester: ["/*"],
  CVSHgvTester: ["/*"],
  CVSAdrTester: ["/*"],
  CVSTirTester: ["/*"],
  VTMAdmin: ["/*"],
  Certs: ["/v1/document-retrieval", "/v1/document-retrieval/*"],
  VehicleData: ["/v1/enquiry", "/v1/enquiry/*"],
  DVLATrailers: ["/v1/trailers", "/v1/trailers/*"],
};

interface AuthorizerConfig {
  [key: string]: NonEmptyArray<string>;
}

const getAssociatedResources = (role: Role): string[] => {
  if (Configuration[role.name] !== undefined) {
    return Configuration[role.name];
  }

  return [];
};

const roleToStatements = (role: Role): Statement[] => {
  const associatedResources: string[] = getAssociatedResources(role);

  let statements: Statement[] = [];

  for (const associatedResource of associatedResources) {
    const parts = associatedResource.substring(1).split("/");
    const resource = parts[0];

    let childResource: string | null = null;

    if (parts.length > 1) {
      childResource = parts.slice(1).join("/");
    }

    if (Object.keys(accessToHttpVerbs).includes(role.access)) {
      statements = [...statements, ...accessToHttpVerbs[role.access].map((httpVerb) => roleToStatement(resource, childResource, httpVerb))];
    }
  }
  return statements;
};

const roleToStatement = (resource: string, childResource: string | null, httpVerb: HttpVerb): Statement => {
  return new StatementBuilder().setEffect("Allow").setHttpVerb(httpVerb).setResource(resource).setChildResource(childResource).build();
};

export function generatePolicy(jwt: Jwt, logEvent: ILogEvent): APIGatewayAuthorizerResult | undefined {
  let statements: Statement[] = [];

  const legacyRoles: Role[] = getLegacyRoles(jwt, logEvent);

  if (!legacyRoles || legacyRoles.length === 0) {
    console.log('No valid roles found');
    return undefined;
  }

  console.log('Role to statements');
  for (const role of legacyRoles) {
    const items = roleToStatements(role);
    statements = statements.concat(items);
  }

  if (!statements || statements.length === 0) {
    console.log('No valid statements found');
    return undefined;
  }

  return {
    principalId: jwt.payload.sub as string,
    policyDocument: newPolicyDocument(statements),
  };
}
