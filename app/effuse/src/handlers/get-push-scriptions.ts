import { EmptyResponse, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler, Result, State } from "../server";
import { SsoAuthService } from "../services/sso-auth-service";
import { NewSsoAuthService } from "../bootstrap/services/sso-auth-service";

export class GetPushSubscriptions extends Handler {
  readonly #sso_auth_service: SsoAuthService;

  constructor(sso_auth_service: SsoAuthService = NewSsoAuthService()) {
    super();
    this.#sso_auth_service = sso_auth_service;
  }

  async Process(request: PureRequest, state: State) {
    const user = await this.#sso_auth_service.GetAdminUser(request, state);
    if (!user) return new Result(new EmptyResponse("NotFound"));

    return new Result(
      new JsonResponse(
        "Ok",
        user.push_subscriptions.map((s) => ({
          Endpoint: s.endpoint,
          Expires: s.expires.toISOString(),
          Keys: s.parameters,
        }))
      )
    );
  }
}
