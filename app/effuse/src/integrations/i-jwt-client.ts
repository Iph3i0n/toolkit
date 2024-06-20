import { Checker } from "@ipheion/safe-type";

export interface IJwtClient {
  CreateJwt<TData>(payload: TData, hours: number): Promise<string>;
  DecodeJwt<TData>(jwt: string, schema: Checker<TData>): Promise<TData>;
}
