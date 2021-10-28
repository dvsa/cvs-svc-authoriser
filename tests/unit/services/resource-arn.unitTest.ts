import { arnToString, ResourceArn, stringToArn } from "../../../src/services/resource-arn";

describe("arnToString()", () => {
  it("should return correct string representation of ARN", () => {
    const arn: ResourceArn = {
      region: "eu-west-1",
      accountId: "1234",
      apiId: "cafe-babe",
      stage: "develop",
      httpVerb: "GET",
      resource: "myResource",
      childResource: "my/child/resource",
    };

    expect(arnToString(arn)).toEqual("arn:aws:execute-api:eu-west-1:1234:cafe-babe/develop/GET/myResource/my/child/resource");
  });
});

describe("stringToArn()", () => {
  it("should return correct ARN representation of string", () => {
    const arn = "arn:aws:execute-api:eu-west-1:1234:cafe-babe/develop/GET/myResource/my/child/resource";

    expect(stringToArn(arn)).toEqual({
      region: "eu-west-1",
      accountId: "1234",
      apiId: "cafe-babe",
      stage: "develop",
      httpVerb: "GET",
      resource: "myResource",
      childResource: "my/child/resource",
    });
  });
});

describe("throw errors", () => {
  it("should throw and error with Arn is null or blank", () => {
    expect(() => {
      stringToArn("");
    }).toThrowError(Error);
    expect(() => {
      stringToArn("");
    }).toThrow("ARN is null or blank");
  });

  it("should throw and error with Arn is null or blank", () => {
    const arn = "arn:aws:execute-apieu-west-1:1234:cafe-babe/develop/GET/myResource/my/child/resource";

    expect(() => {
      stringToArn(arn);
    }).toThrowError(Error);
    expect(() => {
      stringToArn(arn);
    }).toThrow("ARN does not consist of six colon-delimited parts");
  });

  it("should throw and error with Arn is null or blank", () => {
    const arn = "test:aws:execute-api:eu-west-1:1234:cafe-babe/develop/GET/myResource/my/child/resource";

    expect(() => {
      stringToArn(arn);
    }).toThrowError(Error);
    expect(() => {
      stringToArn(arn);
    }).toThrow("ARN part 0 should be exact string 'arn'");
  });

  it("should throw and error with Arn is null or blank", () => {
    const arn = "arn:test:execute-api:eu-west-1:1234:cafe-babe/develop/GET/myResource/my/child/resource";

    expect(() => {
      stringToArn(arn);
    }).toThrowError(Error);
    expect(() => {
      stringToArn(arn);
    }).toThrow("ARN part 1 should be exact string 'aws'");
  });

  it("should throw and error with Arn is null or blank", () => {
    const arn = "arn:aws:test:eu-west-1:1234:cafe-babe/develop/GET/myResource/my/child/resource";

    expect(() => {
      stringToArn(arn);
    }).toThrowError(Error);
    expect(() => {
      stringToArn(arn);
    }).toThrow("ARN part 2 is not 'execute-api' - this is not an API Gateway ARN");
  });

  it("should throw and error with Arn is null or blank", () => {
    const arn = "arn:aws:execute-api:eu-west-1:1234:cafe-babe/develop";

    expect(() => {
      stringToArn(arn);
    }).toThrowError(Error);
    expect(() => {
      stringToArn(arn);
    }).toThrow("ARN path should consist of at least three parts: /{apiId}/{stage}/{httpVerb}/");
  });
});
