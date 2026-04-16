export function toAllVerbsAndAllResources(methodArn: string): string {
  const parts = methodArn?.split("/");

  if (!parts || parts.length < 2) {
    const methodArnText = typeof methodArn === "string" ? `"${methodArn}"` : `(${methodArn})`;
    throw new Error(`Failed to extract arnBase and stageName from methodArn: ${methodArnText}`);
  }

  const arnBase = parts[0];
  const stageName = parts[1];
  const httpVerb = "*";
  const resourcePath = "*";

  return `${arnBase}/${stageName}/${httpVerb}/${resourcePath}`;
}
