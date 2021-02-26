import axios from "axios";
import AuthorizationError from "../models/exceptions/AuthorizationError";
import {ERRORMESSAGES} from "../assets/enum";

export const getCertificateChain = async (jsonWebKeySetUri: string, keyId: string): Promise<string> => {
  const keys: Map<string, string> = await getKeys(jsonWebKeySetUri);

  const certificateChain = keys.get(keyId);

  if (certificateChain) {
    return certificateChain;
  } else {
    throw new AuthorizationError(ERRORMESSAGES.NO_MATCHING_PUBLIC_KEY_FOUND);
  }
}

const getKeys = async (jsonWebKeySetUri: string) => {
  const response = await axios.get(jsonWebKeySetUri);

  const map: Map<string, string> = new Map();

  for (const key of response.data.keys) {
    const keyId = key.kid;
    const certificateChain = `-----BEGIN CERTIFICATE-----\n${key.x5c[0]}\n-----END CERTIFICATE-----`;

    map.set(keyId, certificateChain);
  }

  return map;
}
