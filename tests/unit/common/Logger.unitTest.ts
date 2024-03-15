import { ILogError } from "../../../src/models/ILogError";
import { ILogEvent } from "../../../src/models/ILogEvent";
import errorLogEvent from "../../resources/errorLogEvent.json";
import { writeLogMessage } from "../../../src/common/Logger";
import successLogEvent from "../../resources/successLogEvent.json";
import jwtJson from "../../resources/jwt.json";

describe("test writeLogMessage method", () => {
  const logError: ILogError = {};
  const logErrorEvent: ILogEvent = errorLogEvent;
  const jwtJsonClone = JSON.parse(JSON.stringify(jwtJson));
  logErrorEvent.roles = jwtJsonClone.payload.roles;

  context("when only the log event is passed in", () => {
    it("should return no errors", () => {
      const returnValue: ILogEvent = writeLogMessage(successLogEvent, null);

      expect(returnValue.statusCode).toBe(200);
    });
  });

  context("when log event and error are passed in", () => {
    it("should log TokenExpiredError", () => {
      const error: ILogError = { name: "TokenExpiredError", message: "Error" };
      console.log = jest.fn();

      logError.name = "TokenExpiredError";
      const returnValue: ILogEvent = writeLogMessage(logErrorEvent, error);

      expect(returnValue.error?.name).toBe("TokenExpiredError");
      expect(returnValue.error?.message).toBe("[JWT-ERROR-07] Error at undefined");
      expect(returnValue.error?.username).toBe(logErrorEvent.email);
      expect(returnValue.error?.roles).toBe(logErrorEvent.roles);
    });
    });

    it("should log NotBeforeError", () => {
      const error: ILogError = { name: "NotBeforeError" };
      console.log = jest.fn();

      logError.name = "NotBeforeError";
      const returnValue: ILogEvent = writeLogMessage(logErrorEvent, error);

      expect(returnValue.error?.name).toBe("NotBeforeError");
      expect(returnValue.error?.message).toBe("[JWT-ERROR-08] undefined until undefined");
      expect(returnValue.error?.username).toBe(logErrorEvent.email);
      expect(returnValue.error?.roles).toBe(logErrorEvent.roles);

    });

    it("should log JsonWebTokenError", () => {
      const error: ILogError = { name: "JsonWebTokenError", message: "test" };
      console.log = jest.fn();

      logError.name = "JsonWebTokenError";
      const returnValue: ILogEvent = writeLogMessage(logErrorEvent, error);

      expect(returnValue.error?.name).toBe("JsonWebTokenError");
      expect(returnValue.error?.message).toBe("[JWT-ERROR-09] test");
      expect(returnValue.error?.username).toBe(logErrorEvent.email);
      expect(returnValue.error?.roles).toBe(logErrorEvent.roles);

    });

    it("should log the default error", () => {
      const error: ILogError = { name: "Error", message: "Error" };
      console.log = jest.fn();

      const returnValue: ILogEvent = writeLogMessage(logErrorEvent, error);

      expect(returnValue.error?.name).toBe("Error");
      expect(returnValue.error?.message).toBe("Error");
      expect(returnValue.error?.username).toBe(logErrorEvent.email);
      expect(returnValue.error?.roles).toBe(logErrorEvent.roles);
    });
});
