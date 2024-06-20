import { EmptyResponse, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler, State, Result } from "../server";
import { NewSsoAuthService } from "../bootstrap/services/sso-auth-service";
import { SsoAuthService } from "../services/sso-auth-service";

export class GetUserFromToken extends Handler {
  readonly #sso_auth_service: SsoAuthService;

  constructor(sso_auth_service: SsoAuthService = NewSsoAuthService()) {
    super();
    this.#sso_auth_service = sso_auth_service;
  }

  async Process(request: PureRequest, state: State) {
    const user = await this.#sso_auth_service.GetIdentifyUser(request, state);
    if (!user) return new Result(new EmptyResponse("NotFound"));
    return new Result(new JsonResponse("Ok", { UserId: user.user_id }));
  }
}
