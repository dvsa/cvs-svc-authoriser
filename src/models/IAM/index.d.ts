export type Effect = 'Allow' | 'Deny';
export type Action = "execute-api:Invoke" | "execute-api:api:InvalidateCache" | "execute-api:*";
export type HttpVerb = '*' | 'HEAD' | 'OPTIONS' | 'GET' | 'POST' | 'PUT' | 'DELETE'
