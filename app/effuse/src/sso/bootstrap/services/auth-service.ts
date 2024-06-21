import { AuthService } from "sso/services/auth-service";
import { b } from "../common";
import { NewJwtClient } from "../integrations/jwt-client";

export const NewAuthService = b((s) => new AuthService(s, NewJwtClient(s)));
