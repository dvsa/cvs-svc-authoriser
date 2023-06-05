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
    {
      verbs: ["GET", "OPTIONS"],
      path: "reference/*",
    },
  ],
  "TechRecord.Create": [
    {
      verbs: ["POST", "OPTIONS"],
      path: "vehicles",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "vehicles/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "v2/vehicles/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "reference/*",
    },
  ],
  "TechRecord.View": [
    {
      verbs: ["GET", "OPTIONS"],
      path: "vehicles/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "v2/vehicles/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "v3/technical-records/*",
    },
  ],
  "TechRecord.Archive": [
    {
      verbs: ["PUT", "OPTIONS"],
      path: "vehicles/archive/*",
    },
  ],
  "TestResult.CreateDeskBased": [
    {
      verbs: ["POST", "OPTIONS"],
      path: "test-results",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-stations/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "reference/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "defects",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-types",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-types/*",
    },
  ],
  "TestResult.CreateContingency": [
    {
      verbs: ["POST", "OPTIONS"],
      path: "test-results",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-types",
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
      path: "defects",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "reference/*",
    },
  ],
  "TestResult.Amend": [
    {
      verbs: ["PUT", "OPTIONS"],
      path: "test-results/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-types",
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
      path: "defects",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "reference/*",
    },
  ],
  "TestResult.View": [
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-results/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-types",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "test-types/*",
    },
    {
      verbs: ["GET", "OPTIONS"],
      path: "v1/document-retrieval",
    },
  ],
  "ReferenceData.View": [
    {
      verbs: ["GET", "OPTIONS"],
      path: "reference/*",
    },
  ],
  "ReferenceData.Amend": [
    {
      verbs: ["GET", "OPTIONS", "PUT", "POST", "DELETE"],
      path: "reference/*",
    },
  ],
};
