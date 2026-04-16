import { APIGatewayTokenAuthorizerEvent } from "aws-lambda";
import { envLogger, LogLevel, writeLogMessage } from "../../../src/common/Logger";
import { ILogError } from "../../../src/models/ILogError";
import { ILogEvent } from "../../../src/models/ILogEvent";
import errorLogEvent from "../../resources/errorLogEvent.json";
import successLogEvent from "../../resources/successLogEvent.json";

describe("writeLogMessage()", () => {
  const mockEvent = {} as APIGatewayTokenAuthorizerEvent;

  beforeEach(() => {
    delete process.env.DEBUG_MODE;
    jest.spyOn(console, "log").mockImplementation(jest.fn());
    jest.spyOn(console, "error").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("sets a successful status code when no error is passed", () => {
    const logEvent: ILogEvent = { ...successLogEvent };

    const returnValue = writeLogMessage(mockEvent, logEvent);

    expect(returnValue.statusCode).toBe(200);
    expect(console.log).toHaveBeenCalledWith(returnValue);
  });

  it("formats TokenExpiredError messages", () => {
    const logEvent: ILogEvent = { ...errorLogEvent };
    const error: ILogError = { name: "TokenExpiredError", message: "Error" };

    const returnValue = writeLogMessage(mockEvent, logEvent, error);

    expect(returnValue.statusCode).toBe(401);
    expect(returnValue.error).toEqual({
      name: "TokenExpiredError",
      message: "[JWT-ERROR-07] Error at undefined",
    });
  });

  it("formats NotBeforeError messages", () => {
    const logEvent: ILogEvent = { ...errorLogEvent };
    const error: ILogError = { name: "NotBeforeError" };

    const returnValue = writeLogMessage(mockEvent, logEvent, error);

    expect(returnValue.statusCode).toBe(401);
    expect(returnValue.error).toEqual({
      name: "NotBeforeError",
      message: "[JWT-ERROR-08] undefined until undefined",
    });
  });

  it("formats JsonWebTokenError messages", () => {
    const logEvent: ILogEvent = { ...errorLogEvent };
    const error: ILogError = { name: "JsonWebTokenError", message: "test" };

    const returnValue = writeLogMessage(mockEvent, logEvent, error);

    expect(returnValue.statusCode).toBe(401);
    expect(returnValue.error).toEqual({
      name: "JsonWebTokenError",
      message: "[JWT-ERROR-09] test",
    });
  });

  it("keeps default error details", () => {
    const logEvent: ILogEvent = { ...errorLogEvent };
    const error: ILogError = { name: "Error", message: "Error" };

    const returnValue = writeLogMessage(mockEvent, logEvent, error);

    expect(returnValue.statusCode).toBe(401);
    expect(returnValue.error).toEqual({
      name: "Error",
      message: "Error",
    });
  });

  it("does not log the authorization token by default", () => {
    const logEvent: ILogEvent = { ...errorLogEvent };
    const error: ILogError = { name: "Error", message: "Error" };

    const returnValue = writeLogMessage(
      {
        ...mockEvent,
        authorizationToken: errorLogEvent.token,
      },
      logEvent,
      error,
    );

    expect(returnValue.token).toBeUndefined();
  });

  it("logs the authorization token when DEBUG_MODE is true", () => {
    process.env.DEBUG_MODE = "true";
    const logEvent: ILogEvent = { ...errorLogEvent };
    const error: ILogError = { name: "Error", message: "Error" };

    const returnValue = writeLogMessage(
      {
        ...mockEvent,
        authorizationToken: errorLogEvent.token,
      },
      logEvent,
      error,
    );

    expect(returnValue.token).toEqual(errorLogEvent.token);
  });
});

describe("envLogger()", () => {
  beforeEach(() => {
    delete process.env.DEBUG;
    jest.spyOn(console, "debug").mockImplementation(jest.fn());
    jest.spyOn(console, "info").mockImplementation(jest.fn());
    jest.spyOn(console, "warn").mockImplementation(jest.fn());
    jest.spyOn(console, "error").mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not log when DEBUG is disabled", () => {
    envLogger(LogLevel.DEBUG, "message");

    expect(console.debug).not.toHaveBeenCalled();
  });

  it("logs to the matching console method when DEBUG is enabled", () => {
    process.env.DEBUG = "true";

    envLogger(LogLevel.DEBUG, "debug");
    envLogger(LogLevel.INFO, "info");
    envLogger(LogLevel.WARN, "warn");
    envLogger(LogLevel.ERROR, "error");

    expect(console.debug).toHaveBeenCalledWith(["debug"]);
    expect(console.info).toHaveBeenCalledWith(["info"]);
    expect(console.warn).toHaveBeenCalledWith(["warn"]);
    expect(console.error).toHaveBeenCalledWith(["error"]);
  });
});
