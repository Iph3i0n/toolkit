import { IParameterClient, Parameter } from "./i-parameter-client";
import Path from "node:path";
import Fs from "node:fs/promises";

export class EnvVarParameterClient implements IParameterClient {
  #get_var(name: string) {
    const value = process.env[name];
    if (!value) throw new Error("Missing environment variable " + name);
    return value;
  }

  async GetParameter(name: Parameter): Promise<string> {
    const base = Path.resolve(this.#get_var("DATA_DIR"));
    switch (name) {
      case Parameter.JWT_CERTIFICATE:
        return await Fs.readFile(
          Path.resolve(this.#get_var("DATA_DIR"), "private_key.pem"),
          "utf-8"
        );
      case Parameter.JWT_SECRET:
        return await Fs.readFile(
          Path.resolve(this.#get_var("DATA_DIR"), "signing_key.key"),
          "utf-8"
        );
      default:
        return this.#get_var(name);
    }
  }
}
