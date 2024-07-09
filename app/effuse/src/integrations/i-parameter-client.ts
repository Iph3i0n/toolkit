export const Parameter = Object.freeze({
  ENCRYPTION_PASSPHRASE: "ENCRYPTION_PASSPHRASE",
  JWT_CERTIFICATE: "JWT_CERTIFICATE",
  JWT_SECRET: "JWT_SECRET",
  SSO_BASE: "SSO_BASE",
  SERVER_PASSWORD: "SERVER_PASSWORD",
  SERVER_ADMIN_PASSWORD: "SERVER_ADMIN_PASSWORD",
  UI_URL: "UI_URL",
});

export type Parameter = (typeof Parameter)[keyof typeof Parameter];

export interface IParameterClient {
  GetParameter(name: Parameter): Promise<string>;
}
