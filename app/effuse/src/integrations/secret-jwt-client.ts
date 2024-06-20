import { Assert, Checker, IsObject } from "@ipheion/safe-type";
import { IJwtClient } from "./i-jwt-client";
import { IParameterClient, Parameter } from "./i-parameter-client";
import Jwt from "jsonwebtoken";
import * as DateFns from "date-fns";

export class SecretJwtClient implements IJwtClient {
  readonly #parameter_client: IParameterClient;

  constructor(parameter_client: IParameterClient) {
    this.#parameter_client = parameter_client;
  }

  async CreateJwt<TData>(payload: TData, hours: number): Promise<string> {
    const expire_time = DateFns.addHours(new Date(), hours);
    return Jwt.sign(
      { data: payload, exp: expire_time.getTime() / 1000 },
      await this.#parameter_client.GetParameter(Parameter.JWT_SECRET),
      { algorithm: "RS256" }
    );
  }

  DecodeJwt<TData>(jwt: string, schema: Checker<TData>): Promise<TData> {
    return new Promise<TData>(async (res, rej) => {
      const cert = await this.#parameter_client.GetParameter(
        Parameter.JWT_CERTIFICATE
      );
      Jwt.verify(jwt, cert, { algorithms: ["RS256"] }, (err, payload) => {
        if (err) rej(err);
        else {
          if (typeof payload !== "object") throw new Error("Invalid payload");

          const data = payload.data;
          Assert(schema, data);
          res(data);
        }
      });
    });
  }
}
