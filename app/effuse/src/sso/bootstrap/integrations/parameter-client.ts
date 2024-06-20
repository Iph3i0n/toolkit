import { EnvVarParameterClient } from "$i/env-var-parameter-client";
import { IParameterClient } from "$i/i-parameter-client";
import { b } from "../common";

export const NewParameterClient = b(
  (): IParameterClient => new EnvVarParameterClient()
);
