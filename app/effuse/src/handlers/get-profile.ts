import { EmptyResponse, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler, Result, State } from "../server";
import { SsoAuthService } from "../services/sso-auth-service";
import { NewSsoAuthService } from "../bootstrap/services/sso-auth-service";

export class GetProfile extends Handler {
  readonly #sso_auth_service: SsoAuthService;

  constructor(sso_auth_service: SsoAuthService = NewSsoAuthService()) {
    super();
    this.#sso_auth_service = sso_auth_service;
  }

  async Process(request: PureRequest, state: State) {
    const { UserId } = await this.#sso_auth_service.Auth(request);
    if (!UserId) return new Result(new EmptyResponse("NotFound"));
    const user = state.users[UserId];
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
