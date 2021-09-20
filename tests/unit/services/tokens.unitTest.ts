import { getValidJwt } from "../../../src/services/tokens";
import { JWT_MESSAGE } from "../../../src/models/enums";

describe("getValidJwt()", () => {
  it("should fail on blank authorization token", async () => {
    expect(() => {
      getValidJwt("");
    }).toThrowError(JWT_MESSAGE.NO_AUTH_HEADER);
  });

  it("should fail on non-Bearer authorization token", async () => {
    expect(() => {
      getValidJwt("not a Bearer");
    }).toThrowError(JWT_MESSAGE.NO_BEARER_PREFIX);
  });

  it("should fail when Bearer prefix is present, but token value isn't", async () => {
    expect(() => {
      getValidJwt("Bearer");
    }).toThrowError(JWT_MESSAGE.BLANK_TOKEN);
  });

  it("should fail when Bearer prefix is present, but token value is blank", async () => {
    expect(() => {
      getValidJwt("Bearer      ");
    }).toThrowError(JWT_MESSAGE.BLANK_TOKEN);
  });

  it("should fail on invalid JWT token", async () => {
    expect(() => {
      getValidJwt("Bearer invalidJwt");
    }).toThrowError(JWT_MESSAGE.DECODE_FAILED);
  });

  it("should pass on valid JWT token without preferred_username or unique_name ", async () => {
    const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRiJ9";
    const payload = "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ0aWQiOiIxMjM0NTYiLCJleHAiOjYzMTAwNTMzNH0";
    const signature = "DUmbnmFG6y-AxpT578vTwVeHoT04LyAwcdhDdvxby_A";

    expect(getValidJwt(`Bearer ${header}.${payload}.${signature}`)).toMatchObject({
      header: {
        kid: "ABCDEF",
      },
      payload: {
        tid: "123456",
        exp: 631005334,
      },
    });
  });
  it("should pass on valid JWT token with unique_name ", async () => {
    const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRiJ9";
    const payload = "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ0aWQiOiIxMjM0NTYiLCJleHAiOjYzMTAwNTMzNCwidW5pcXVlX25hbWUiOiJ0ZXN0In0";
    const signature = "DUmbnmFG6y-AxpT578vTwVeHoT04LyAwcdhDdvxby_A";

    expect(getValidJwt(`Bearer ${header}.${payload}.${signature}`)).toMatchObject({
      header: {
        kid: "ABCDEF",
      },
      payload: {
        tid: "123456",
        exp: 631005334,
        unique_name: "test",
      },
    });
  });
  it("should pass on valid JWT token with preferred_username ", async () => {
    const header = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRiJ9";
    const payload = "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ0aWQiOiIxMjM0NTYiLCJleHAiOjYzMTAwNTMzNCwicHJlZmVycmVkX3VzZXJuYW1lIjoidGVzdCJ9";
    const signature = "DUmbnmFG6y-AxpT578vTwVeHoT04LyAwcdhDdvxby_A";

    expect(getValidJwt(`Bearer ${header}.${payload}.${signature}`)).toMatchObject({
      header: {
        kid: "ABCDEF",
      },
      payload: {
        tid: "123456",
        exp: 631005334,
        preferred_username: "test",
      },
    });
  });
});
