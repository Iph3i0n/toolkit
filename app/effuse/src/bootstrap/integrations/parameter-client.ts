import { EnvVarParameterClient } from "../../integrations/env-var-parameter-client";
import { IParameterClient } from "../../integrations/i-parameter-client";
import { b } from "../common";

export const NewParameterClient = b(
  (): IParameterClient => new EnvVarParameterClient()
);
