export interface KeyModel {
  kty?: string;
  use?: string;
  kid: string;
  x5t?: string;
  n?: string;
  e?: string;
  x5c: [any];
}
