import { NewAuthService } from "$sso/b/services/auth-service";
import { AuthService } from "$sso/s/auth-service";
import { Handler, Result, State } from "$sso/server";
import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";

export default class GetRefreshToken extends Handler {
  readonly #auth_service: AuthService;

  constructor(state: State, auth_service: AuthService = NewAuthService(state)) {
    super(state);
    this.#auth_service = auth_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/auth/refresh-token";

  async Process(request: PureRequest) {
    const { token } = request.Parameters({ token: IsString }) ?? {};

    if (!token) return new Result(new EmptyResponse("BadRequest"));

    const [user, user_id] = await this.#auth_service.GetRefreshUser(token);
    if (!user) return new Result(new EmptyResponse("NotFound"));

    const grant = await this.#auth_service.CreateGrant(user_id);

    return new Result(
      new JsonResponse("Ok", {
        AdminToken: grant.UserToken,
        ServerToken: grant.ServerToken,
        UserId: grant.UserId,
        RefreshToken: grant.RefreshToken,
        Expires: grant.Expires.toISOString(),
      })
    );
  }
}
