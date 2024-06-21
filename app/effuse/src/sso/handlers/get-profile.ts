import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler, Result, State } from "sso/server";
import { NewAuthService } from "sso/bootstrap/services/auth-service";
import { AuthService } from "sso/services/auth-service";

export default class GetProfile extends Handler {
  readonly #auth_service: AuthService;

  constructor(state: State, auth_service: AuthService = NewAuthService(state)) {
    super(state);
    this.#auth_service = auth_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/user/profile";

  async Process(request: PureRequest) {
    const [user, user_id] = await this.#auth_service.GetAdminUser(request);
    if (!user) return new Result(new EmptyResponse("NotFound"));

    return new Result(
      new JsonResponse("Ok", {
        UserId: user_id,
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
