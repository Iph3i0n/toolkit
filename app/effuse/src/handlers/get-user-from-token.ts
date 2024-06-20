import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler, State, Result } from "../server";
import { NewSsoAuthService } from "../bootstrap/services/sso-auth-service";
import { SsoAuthService } from "../services/sso-auth-service";

export class GetUserFromToken extends Handler {
  readonly #sso_auth_service: SsoAuthService;

  constructor(
    state: State,
    sso_auth_service: SsoAuthService = NewSsoAuthService(state)
  ) {
    super(state);
    this.#sso_auth_service = sso_auth_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/auth/user";

  async Process(request: PureRequest) {
    const user = await this.#sso_auth_service.GetIdentifyUser(request);
    if (!user) return new Result(new EmptyResponse("NotFound"));
    return new Result(new JsonResponse("Ok", { UserId: user.user_id }));
  }
}
