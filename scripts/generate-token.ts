import { ClientCredentials } from "@dvsa/appdev-api-common";

const cc = new ClientCredentials(process.env.TOKEN_URL!, process.env.CLIENT_ID!, process.env.CLIENT_SECRET!, process.env.SCOPE!, undefined);

console.log("Generating token....");
console.log(await cc.getAccessToken());
