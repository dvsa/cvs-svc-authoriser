import { PolicyDocument, Statement } from "aws-lambda";
export default (statements: Statement[]): PolicyDocument => {
  return {
    Version: "2012-10-17",
    Statement: statements,
  };
};
