export type HttpVerb = "*" | "HEAD" | "OPTIONS" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "TRACE";

const httpVerbs: HttpVerb[] = ["*", "HEAD", "OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE", "TRACE"];

export const toHttpVerb = (candidate: string): HttpVerb => {
  if (!(httpVerbs as string[]).includes(candidate.toUpperCase())) {
    throw new Error(`not a recognized HTTP verb: '${candidate}'`);
  }

  return candidate.toUpperCase() as HttpVerb;
};
