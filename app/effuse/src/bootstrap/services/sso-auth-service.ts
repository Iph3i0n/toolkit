import { SsoAuthService } from "../../services/sso-auth-service";
import { b } from "../common";
import { NewJwtClient } from "../integrations/jwt-client";

export const NewSsoAuthService = b(
  (s) => new SsoAuthService(s, NewJwtClient(s))
);
