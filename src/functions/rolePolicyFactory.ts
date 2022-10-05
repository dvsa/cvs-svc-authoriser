import { APIGatewayAuthorizerResult, Statement } from "aws-lambda";
import { AccessHttpVerbMap } from "../models/AccessHttpVerbMap";
import { HttpVerb } from "../services/http-verbs";
import Role from "../services/roles";
import StatementBuilder from "../services/StatementBuilder";
import newPolicyDocument from "./newPolicyDocument";

type NonEmptyArray<T> = [T, ...T[]];

const accessToHttpVerbs: AccessHttpVerbMap = {
  read: ["GET", "HEAD"],
  write: ["*"],
  view: ["GET"],
};

const Configuration: AuthorizerConfig = {
  CVSFullAccess: ["/*"],
  CVSPsvTester: ["/*"],
  CVSHgvTester: ["/*"],
  CVSAdrTester: ["/*"],
  CVSTirTester: ["/*"],
  VTMAdmin: ["/*"],
  Certs: ["/*"],
  VehicleData: ["/*"],
  DVLATrailers: ["/*/trailers", "/*/trailers/*"],
  "TechRecord.View": ["/vehicles/*"],
};

interface AuthorizerConfig {
  [key: string]: NonEmptyArray<string>;
}

const getAssociatedResources = (role: Role): string[] => {
  if (Configuration[role.name] !== undefined) {
    return Configuration[role.name];
  }

  if (role.name === "TechRecord" && role.access === "view") {
    return Configuration["TechRecord.View"];
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

export function generatePolicy(jwt: any, legacyRoles: Role[]): APIGatewayAuthorizerResult | PromiseLike<APIGatewayAuthorizerResult> {
  let statements: Statement[] = [];

  for (const role of legacyRoles) {
    const items = roleToStatements(role);
    statements = statements.concat(items);
  }

  return {
    principalId: jwt.payload.sub,
    policyDocument: newPolicyDocument(statements),
  };
}
