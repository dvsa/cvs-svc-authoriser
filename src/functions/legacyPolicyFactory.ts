import { APIGatewayAuthorizerResult, Statement } from "aws-lambda";
import { AuthorizerConfig, getAssociatedResources } from "../services/configuration";
import { AccessHttpVerbMap } from "../models/AccessHttpVerbMap";
import { HttpVerb } from "../services/http-verbs";
import Role from "../services/roles";
import StatementBuilder from "../services/StatementBuilder";
import newPolicyDocument from "./newPolicyDocument";
import { ILogEvent } from "../models/ILogEvent";
import { writeLogMessage } from "../common/Logger";

const accessToHttpVerbs: AccessHttpVerbMap = {
    read: ["GET", "HEAD"],
    write: ["*"],
    view: ["GET"],
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
  
  export function generatePolicy(jwt: any, legacyRoles: Role[], config: AuthorizerConfig): APIGatewayAuthorizerResult | PromiseLike<APIGatewayAuthorizerResult> {
    let statements: Statement[] = [];
  
    for (const role of legacyRoles) {
      const items = roleToStatements(role, config);
      statements = statements.concat(items);
    }
    
    return {
      principalId: jwt.payload.sub,
      policyDocument: newPolicyDocument(statements),
    };
  }