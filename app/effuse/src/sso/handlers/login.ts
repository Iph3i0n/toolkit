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

export default class Login extends Handler {
  readonly #auth_service: AuthService;

  constructor(state: State, auth_service: AuthService = NewAuthService(state)) {
    super(state);
    this.#auth_service = auth_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/auth/token";

  async Process(request: PureRequest) {
    const { email, password } =
      request.Parameters({
        email: IsString,
        password: IsString,
      }) ?? {};

    if (!email || !password) return new Result(new EmptyResponse("BadRequest"));

    for (const [user_id, user] of this.State.users) {
      if (user.email !== email) continue;

      if (!(await this.#auth_service.IsMatch(password, user.encrypted_email)))
        return new Result(new EmptyResponse("NotFound"));

      const grant = await this.#auth_service.CreateGrant(user_id);

      return new Result(
        new JsonResponse("Ok", {
          AdminToken: grant.UserToken,
          ServerToken: grant.ServerToken,
          UserId: grant.UserId,
          RefreshToken: grant.RefreshToken,
          Expires: grant.Expires.toISOString(),
        }),
        {
          users: {
            [user_id]: {
              ...user,
              last_sign_in: new Date(),
            },
          },
        }
      );
    }

    return new Result(new EmptyResponse("NotFound"));
  }
}
