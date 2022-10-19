import { HttpVerb } from "../services/http-verbs";
export type NonEmptyArray<T> = [T, ...T[]];
export interface IApiAccess {
  verbs: HttpVerb[];
  path: string;
}

export const functionConfig: { [key: string]: NonEmptyArray<IApiAccess> } = {
  "TechRecord.Amend": [
    {
      verbs: ["POST", "PUT", "OPTIONS"],
      path: "vehicles/*",
    },
  ],
  "TechRecord.View": [
    {
      verbs: ["GET", "OPTIONS"],
      path: "vehicles/*",
    },
  ],
  "TestResult.Amend": [
    {
      verbs: ["POST", "PUT", "OPTIONS"],
      path: "test-result/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-types/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-stations/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "defects/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "reference/*",
    },
  ],
  "TestResult.View": [
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-result/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-types/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "v1/document-retrieval/*",
    },
  ],
};
