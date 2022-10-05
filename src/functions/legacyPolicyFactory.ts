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

const CONFIGURATION: AuthorizerConfig = {
  roleToResources: [
    {
      roleName: "CVSFullAccess",
      associatedResources: ["/*"],
    },
    {
      roleName: "CVSPsvTester",
      associatedResources: ["/*"],
    },
    {
      roleName: "CVSHgvTester",
      associatedResources: ["/*"],
    },
    {
      roleName: "CVSAdrTester",
      associatedResources: ["/*"],
    },
    {
      roleName: "CVSTirTester",
      associatedResources: ["/*"],
    },
    {
      roleName: "VTMAdmin",
      associatedResources: ["/*"],
    },
    {
      roleName: "Certs",
      associatedResources: ["/*"],
    },
    {
      roleName: "VehicleData",
      associatedResources: ["/*"],
    },
    {
      roleName: "DVLATrailers",
      associatedResources: ["/*/trailers", "/*/trailers/*"],
    },
    {
      roleName: "TechRecord.View",
      associatedResources: ["/vehicles/*"],
    },
  ],
};

interface AuthorizerConfig {
  roleToResources: ResourceMapping[];
}

interface ResourceMapping {
  roleName: string;
  associatedResources: NonEmptyArray<string>;
}

const getAssociatedResources = (role: Role, config: AuthorizerConfig): string[] => {
  for (const resourceMapping of config.roleToResources) {
    if (resourceMapping.roleName === role.name) {
      return resourceMapping.associatedResources;
    }
    if (resourceMapping.roleName.includes(".")) {
      const [object, action] = resourceMapping.roleName.split(".");
      if (role.name === object && role.access === action.toLowerCase()) return resourceMapping.associatedResources;
    }
  }

  return [];
};

const roleToStatements = (role: Role, config: AuthorizerConfig): Statement[] => {
  const associatedResources: string[] = getAssociatedResources(role, config);

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
    const items = roleToStatements(role, CONFIGURATION);
    statements = statements.concat(items);
  }

  return {
    principalId: jwt.payload.sub,
    policyDocument: newPolicyDocument(statements),
  };
}
