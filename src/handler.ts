import {authoriser} from "./functions/authoriser";
import {APIGatewayTokenAuthorizerEvent, Context} from "aws-lambda";
import {APIGatewayAuthorizerResult} from "aws-lambda/trigger/api-gateway-authorizer";

export const handler = async (event: APIGatewayTokenAuthorizerEvent, context: Context): Promise<APIGatewayAuthorizerResult> => {
  return authoriser(event, context);
}
