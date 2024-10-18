import * as azure from "../../../src/services/azure";

describe("getCertificateChain()", () => {
  const fetchSpy = (keyId: string, publicKey: string) =>
    jest.spyOn(azure, "fetchKeys").mockImplementation(() => {
      return Promise.resolve({
        json() {
          return Promise.resolve({
            keys: [
              {
                kty: "RSA",
                use: "sig",
                kid: keyId,
                x5t: "mySuperSecureThumbprint",
                n: "rsa-n",
                e: "rsa-e",
                x5c: [publicKey],
              },
            ],
          });
        },
      } as Response);
    });

  it("should return an x5c given an existing key ID", async (): Promise<void> => {
    const publicKey = "mySuperSecurePublicKey";
    fetchSpy("keyToTheKingdom", publicKey);

    await expect(azure.getCertificateChain("tenantId", "keyToTheKingdom")).resolves.toEqual(`-----BEGIN CERTIFICATE-----\n${publicKey}\n-----END CERTIFICATE-----`);
  });

  it("should throw an error if no key matches the given key ID", async (): Promise<void> => {
    fetchSpy("somethingElse", "mySuperSecurePublicKey");

    await expect(azure.getCertificateChain("tenantId", "otherKeyToTheKingdom")).rejects.toThrow("no public key");
  });
});
