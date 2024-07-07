import Axios from "axios";
import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Assert, IsObject, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class GetAuthToken extends Handler {
  readonly #auth_service: AuthService;
  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/auth/token";

  async Process(request: PureRequest) {
    const body = request.Parameters({ token: IsString });
    const url = new URL("/api/v1/auth/user", process.env.SSO_URL);
    url.searchParams.set("token", body.token);
    const { data } = await Axios.get(url.href);

    Assert(IsObject({ UserId: IsString }), data);
    const existing = this.State.users[data.UserId];
    if (!existing) return new Result(new EmptyResponse("Unauthorised"));
    const role = this.State.roles[existing.role];

    const grant = await this.#auth_service.CreateGrant(data.UserId);
    return new Result(
      new JsonResponse("Ok", {
        LocalToken: grant.Token,
        IsAdmin: role.admin,
        Expires: grant.Expires.toISOString(),
        UserId: grant.UserId,
      }),
      {
        users: {
          [data.UserId]: {
            ...existing,
            last_logged_in: new Date(),
          },
        },
      }
    );
  }
}
