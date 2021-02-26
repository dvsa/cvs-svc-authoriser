import nock from "nock";
import {getCertificateChain} from "../../src/services/azure";
import {NO_MATCHING_PUBLIC_KEY_FOUND} from "../../src/models/exceptions/errors";

describe('getCertificateChain()', () => {
  it('should return an x5c given an existing key ID', async (): Promise<void> => {
    const publicKey = 'mySuperSecurePublicKey';
    setUpKey('keyToTheKingdom', publicKey);

    await expect(getCertificateChain('http://localhost/tenantId/discovery/keys', 'keyToTheKingdom'))
      .resolves.toEqual(`-----BEGIN CERTIFICATE-----\n${publicKey}\n-----END CERTIFICATE-----`);
  });

  it('should throw an error if no key matches the given key ID', async (): Promise<void> => {
    setUpKey('somethingElse', 'mySuperSecurePublicKey');

    await expect(getCertificateChain('http://localhost/tenantId/discovery/keys', 'keyToTheKingdom'))
      .rejects.toThrowError(NO_MATCHING_PUBLIC_KEY_FOUND);
  });

  const setUpKey = (keyId: string, publicKey: string) => {
    nock('http://localhost')
      .get('/tenantId/discovery/keys')
      .reply(200, JSON.stringify({
        keys: [
          {
            kty: 'RSA',
            use: 'sig',
            kid: keyId,
            x5t: 'mySuperSecureThumbprint',
            n: 'rsa-n',
            e: 'rsa-e',
            x5c: [ publicKey ]
          }
        ]
      }));
  };
})
