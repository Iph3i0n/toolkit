import { IJwtClient } from "$i/i-jwt-client";
import { SecretJwtClient } from "$i/secret-jwt-client";
import { b } from "../common";
import { NewParameterClient } from "./parameter-client";

export const NewJwtClient = b(
  (s): IJwtClient => new SecretJwtClient(NewParameterClient(s))
);
