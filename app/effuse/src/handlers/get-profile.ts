import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler, Result, State } from "../server";
import { SsoAuthService } from "../services/sso-auth-service";
import { NewSsoAuthService } from "../bootstrap/services/sso-auth-service";

export class GetProfile extends Handler {
  readonly #sso_auth_service: SsoAuthService;

  constructor(
    state: State,
    sso_auth_service: SsoAuthService = NewSsoAuthService(state)
  ) {
    super(state);
    this.#sso_auth_service = sso_auth_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/user/profile";

  async Process(request: PureRequest) {
    const user = await this.#sso_auth_service.GetAdminUser(request);
    if (!user) return new Result(new EmptyResponse("NotFound"));

    return new Result(
      new JsonResponse("Ok", {
        UserId: user.user_id,
        Email: user.email,
        UserName: user.username,
        Biography: user.biography,
        RegisteredAt: user.registered_at.toISOString(),
        LastSignIn: user.last_sign_in.toISOString(),
        Servers: user.servers.map((s) => ({
          Url: s.url,
          JoinedAt: s.joined_at.toISOString(),
        })),
      })
    );
  }
}
