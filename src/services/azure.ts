import { KeyResponse } from "../models/KeyResponse";
import { envLogger, LogLevel } from "../common/Logger";

const cache: Map<string, Map<string, string>> = new Map();

export const getCertificateChain = async (tenantId: string, keyId: string): Promise<string> => {
  const cacheKeys = cache.get(tenantId);

  envLogger(LogLevel.DEBUG, `Cache ${cacheKeys ? "hit" : "not hit"}`);

  const keys: Map<string, string> = cacheKeys ?? (await getKeys(tenantId));

  envLogger(LogLevel.DEBUG, "Public keys read");

  if (!cache.has(tenantId)) {
    cache.set(tenantId, keys);
  }

  const certificateChain = keys.get(keyId);

  if (!certificateChain) {
    throw new Error(`no public key with ID '${keyId}' under tenant ${tenantId}`);
  }

  return certificateChain;
};

const getKeys = async (tenantId: string): Promise<Map<string, string>> => {
  const response = await fetchKeys(tenantId);

  const map: Map<string, string> = new Map();

  const resp: KeyResponse = await response.json();

  for (const key of resp.keys) {
    const keyId = key.kid;
    const certificateChain = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;

    map.set(keyId, certificateChain);
  }

  envLogger(LogLevel.DEBUG, "Key Map Created");
  return map;
};

export const fetchKeys = (tenantId: string) => {
  envLogger(LogLevel.DEBUG, `Fetching keys from https://login.microsoftonline.com/${tenantId}/discovery/keys`);
  return fetch(`https://login.microsoftonline.com/${tenantId}/discovery/keys`);
};
