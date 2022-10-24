import * as jsonWebToken from "jsonwebtoken";
import { getCertificateChain } from "../../../src/services/azure";
import jwtJson from "../../resources/jwt.json";
import { checkSignature } from "../../../src/services/signature-check";

const DEFAULT_TENANT_ID:string = "9122040d-6c67-4c5b-b112-36a304b66dad";
const DEFAULT_CLIENT_ID:string = "123456";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn().mockImplementationOnce((token, _certificate, _options) => token),
}));

describe("checkSignature()", () => {
  beforeAll(() => {
    (getCertificateChain as jest.Mock) = jest.fn().mockReturnValue("fake certificate");
  });

  it("should successfully verify token strings", async () => {
    const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRiJ9";
    const payload = "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ0aWQiOiIxMjM0NTYifQ";
    const signature = "DUmbnmFG6y-AxpT578vTwVeHoT04LyAwcdhDdvxby_A";

    await expect(checkSignature(`${header}.${payload}.${signature}`, jwtJson, DEFAULT_TENANT_ID, DEFAULT_CLIENT_ID)).resolves.not.toThrowError();

    expect(jsonWebToken.verify).toBeCalledWith(`${header}.${payload}.${signature}`, "fake certificate", {
      audience: DEFAULT_CLIENT_ID,
      issuer: `https://sts.windows.net/${DEFAULT_TENANT_ID}/`,
      algorithms: ["RS256"],
    });
  });
});
