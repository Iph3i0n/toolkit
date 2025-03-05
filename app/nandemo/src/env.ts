import { IsString, IsType } from "@ipheion/safe-type";

const EnvVars = {
  DATABASE_LOCATION: IsString,
  LOGIN_SECRET: IsString,
  OAUTH_BASE_URL: IsString,
  OAUTH_CLIENT_ID: IsString,
  OAUTH_ISSUER_BASE_URL: IsString,
  IMAGES_LOCATION: IsString,
};

type EnvVar = keyof typeof EnvVars;

type EnvVarType<T extends EnvVar> = IsType<(typeof EnvVars)[T]>;

export default class Env {
  static Get<TKey extends EnvVar>(key: TKey): EnvVarType<TKey> {
    const value = this.Find(key);
    if (!value) throw new Error(`${key} is required`);
    return value;
  }

  static Find<TKey extends EnvVar>(key: TKey): EnvVarType<TKey> | undefined {
    const value = process.env[key];
    if (!EnvVars[key](value)) return undefined;
    return value as EnvVarType<TKey>;
  }
}
