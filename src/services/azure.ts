import axios from "axios";
import AuthorizationError from "../models/exceptions/AuthorizationError";
import {NO_MATCHING_PUBLIC_KEY_FOUND} from "../models/exceptions/errors";

export const getCertificateChain = async (jsonWebKeySetUri: string, keyId: string): Promise<string> => {
  const keys: Map<string, string> = await getKeys(jsonWebKeySetUri);

  const certificateChain = keys.get(keyId);

  if (!certificateChain) {
    throw new AuthorizationError(NO_MATCHING_PUBLIC_KEY_FOUND);
  }

  return certificateChain;
}

const getKeys = async (jsonWebKeySetUri: string): Promise<Map<string, string>> => {
  const response = await axios.get(jsonWebKeySetUri);

  const map: Map<string, string> = new Map();

  for (const key of response.data.keys) {
    const keyId = key.kid;
    const certificateChain = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;

    map.set(keyId, certificateChain);
  }

  return map;
}
