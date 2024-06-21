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

export default class GetToken extends Handler {
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

    const user_email = this.State.user_emails[email];
    if (!user_email) return new Result(new EmptyResponse("NotFound"));

    const user = this.State.users[user_email.user_id];
    if (!user) return new Result(new EmptyResponse("NotFound"));
    if (!(await this.#auth_service.IsMatch(password, user.encrypted_password)))
      return new Result(new EmptyResponse("NotFound"));

    const grant = await this.#auth_service.CreateGrant(user_email.user_id);

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
          [user_email.user_id]: {
            ...user,
            last_sign_in: new Date(),
          },
        },
      }
    );
  }
}
