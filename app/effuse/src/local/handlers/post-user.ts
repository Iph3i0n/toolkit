import { EmptyResponse, HttpMethod, PureRequest } from "@ipheion/puristee";
import { Handler, Result } from "../server";
import Axios from "axios";
import { Assert, IsObject, IsString } from "@ipheion/safe-type";
import { IParameterClient, Parameter } from "integrations/i-parameter-client";
import { NewParameterClient } from "local/bootstrap/integrations/parameter-client";
import { AuthService } from "local/services/auth-service";
import { NewAuthService } from "local/bootstrap/services/auth-service";

export default class PostUser extends Handler {
  readonly #parameters: IParameterClient;
  readonly #auth_service: AuthService;
  constructor(parameters?: IParameterClient, auth_service?: AuthService) {
    super();
    this.#parameters = parameters ?? NewParameterClient(this.State);
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/users";

  async Process(request: PureRequest) {
    const body = request.Body(
      IsObject({ ServerToken: IsString, Password: IsString })
    );

    const url = new URL("/api/v1/auth/user", process.env.SSO_URL);
    url.searchParams.set("token", body.ServerToken);
    const { data } = await Axios.get(url.href);

    Assert(IsObject({ UserId: IsString }), data);
    const existing = this.State.users[data.UserId];
    if (existing) return new EmptyResponse("Ok");

    for (const [role_id, role] of this.State.roles)
      if (body.Password === role.password)
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

    return new Result(new EmptyResponse("Unauthorised"));
  }
}
