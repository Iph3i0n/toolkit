import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler, State, Result } from "sso/server";
import { NewAuthService } from "sso/bootstrap/services/auth-service";
import { AuthService } from "sso/services/auth-service";

export default class GetUserFromToken extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/auth/user";

  async Process(request: PureRequest) {
    const [user, user_id] = await this.#auth_service.GetIdentifyUser(request);
    if (!user) return new Result(new EmptyResponse("NotFound"));
    return new Result(new JsonResponse("Ok", { UserId: user_id }));
  }
}
