import { toHttpVerb } from "../../../src/services/http-verbs";

describe("toHttpVerb()", () => {
  it("should return correct httpVerb from string", () => {
    expect(toHttpVerb("*")).toEqual("*");
    expect(toHttpVerb("HEAD")).toEqual("HEAD");
    expect(toHttpVerb("OPTIONS")).toEqual("OPTIONS");
    expect(toHttpVerb("GET")).toEqual("GET");
    expect(toHttpVerb("POST")).toEqual("POST");
    expect(toHttpVerb("PUT")).toEqual("PUT");
    expect(toHttpVerb("PATCH")).toEqual("PATCH");
    expect(toHttpVerb("DELETE")).toEqual("DELETE");
    expect(toHttpVerb("TRACE")).toEqual("TRACE");
  });
});

describe("Throw error", () => {
  it("should throw an error", () => {
    expect(() => {
      toHttpVerb("TEST");
    }).toThrowError(Error);
    expect(() => {
      toHttpVerb("TEST");
    }).toThrow("not a recognized HTTP verb: 'TEST'");
  });
});
