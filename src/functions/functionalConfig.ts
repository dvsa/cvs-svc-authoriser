import { HttpVerb } from "../services/http-verbs";
export type NonEmptyArray<T> = [T, ...T[]];
export interface IApiAccess {
  verb: HttpVerb;
  path: string;
}

export const functionConfig: { [key: string]: NonEmptyArray<IApiAccess> } = {
  "TechRecord.Amend": [
    {
      verb: "POST",
      path: "vehicles/*",
    },
    {
      verb: "PUT",
      path: "vehicles/*",
    },
  ],
  "TechRecord.View": [
    {
      verb: "GET",
      path: "vehicles/*",
    },
  ],
  "TestResult.Amend": [
    {
      verb: "POST",
      path: "test-result/*",
    },
    {
      verb: "PUT",
      path: "test-result/*",
    },
    {
      verb: "GET",
      path: "test-types/*",
    },
    {
      verb: "GET",
      path: "test-stations/*",
    },
    {
      verb: "GET",
      path: "defects/*",
    },
    {
      verb: "GET",
      path: "reference/*",
    },
  ],
  "TestResult.View": [
    {
      verb: "GET",
      path: "test-result/*",
    },
    {
      verb: "GET",
      path: "test-types/*",
    },
    {
      verb: "GET",
      path: "v1/document-retrieval/*",
    },
  ],
};
