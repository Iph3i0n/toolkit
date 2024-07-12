import { EmptyResponse, HttpMethod, PureRequest } from "@ipheion/puristee";
import { Handler, Result } from "../server";
import Axios from "axios";
import { Assert, IsObject, IsString } from "@ipheion/safe-type";
import { AuthService } from "local/services/auth-service";
import { NewAuthService } from "local/bootstrap/services/auth-service";

export default class PostUser extends Handler {
  readonly #auth_service: AuthService;
  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/users";

  async Process(request: PureRequest) {
    const body = request.Body(
      IsObject({ ServerToken: IsString, RoleToken: IsString })
    );

    const url = new URL("/api/v1/auth/user", process.env.SSO_URL);
    url.searchParams.set("token", body.ServerToken);
    const { data } = await Axios.get(url.href);

    Assert(IsObject({ UserId: IsString }), data);
    const existing = this.State.users[data.UserId];
    if (existing) return new EmptyResponse("Ok");

    const role_id = await this.#auth_service.GetInviteRoleId(body.RoleToken);
    const role = this.State.roles[role_id];
    if (!role) return new EmptyResponse("Unauthorised");
    return new Result(new EmptyResponse("Created"), {
      users: {
        [data.UserId]: {
          version: 1,
          joined_server: new Date(),
          last_logged_in: new Date(),
          banned: false,
          role: role_id,
        },
      },
    });
  }
}
