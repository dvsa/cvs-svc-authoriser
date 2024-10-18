import { KeyResponse } from "../models/KeyResponse";

export const getCertificateChain = async (tenantId: string, keyId: string): Promise<string> => {
  const keys: Map<string, string> = await getKeys(tenantId);

  console.log("Keys fetched");

  const certificateChain = keys.get(keyId);

  if (!certificateChain) {
    throw new Error(`no public key with ID '${keyId}' under tenant ${tenantId}`);
  }

  return certificateChain;
};

const getKeys = async (tenantId: string): Promise<Map<string, string>> => {
  const response = await fetchKeys(tenantId);
  console.log("Public Keys Read")
  const map: Map<string, string> = new Map();

  const resp: KeyResponse = await response.json();

  for (const key of resp.keys) {
    const keyId = key.kid;
    const certificateChain = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;

    map.set(keyId, certificateChain);
  }
  console.log("Key Map Created")
  return map;
};

export const fetchKeys = (tenantId: string) => {
  console.log("Fetching keys from https://login.microsoftonline.com/${tenantId}/discovery/keys");
  return fetch(`https://login.microsoftonline.com/${tenantId}/discovery/keys`);
};
