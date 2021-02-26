export default interface AuthorizerConfig {
  azure: {
    tennant: string
    appId: string
    issuer: string
    jwk_endpoint: string
  };
}
