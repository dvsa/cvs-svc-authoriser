import { APIGatewayEvent } from "aws-lambda";

/**
 * Lambda to call to test the authoriser.
 * @param event - AWS Lambda event object
 * @returns - Promise<string>
 */
export const test = async (event: APIGatewayEvent): Promise<string> => {
  return "Test function successfully invoked. Access was granted.";
};
