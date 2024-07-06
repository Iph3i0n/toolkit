import { EmptyResponse, HttpMethod, PureRequest } from "@ipheion/puristee";
import { Handler, Result } from "../server";
import Axios from "axios";
import { Assert, IsObject, IsString } from "@ipheion/safe-type";
import { IParameterClient, Parameter } from "integrations/i-parameter-client";
import { NewParameterClient } from "local/bootstrap/integrations/parameter-client";

export default class PostUser extends Handler {
  readonly #parameters: IParameterClient;
  constructor(parameters?: IParameterClient) {
    super();
    this.#parameters = parameters ?? NewParameterClient(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/users";

  async Process(request: PureRequest) {
    const body = request.Body(
      IsObject({ ServerToken: IsString, Password: IsString })
    );
    if (!body) return new EmptyResponse("BadRequest");

    const url = new URL("/api/v1/auth/user", process.env.SSO_URL);
    url.searchParams.set("token", body.ServerToken);
    const { data } = await Axios.get(url.href);

    Assert(IsObject({ UserId: IsString }), data);
    const existing = this.State.users[data.UserId];
    if (existing) return new EmptyResponse("Ok");

    if (
      body.Password ===
      (await this.#parameters.GetParameter(Parameter.SERVER_PASSWORD))
    ) {
      return new Result(new EmptyResponse("Created"), {
        users: {
          [data.UserId]: {
            version: 1,
            joined_server: new Date(),
            last_logged_in: new Date(),
            admin: false,
            banned: false,
            role: null,
            policies: [],
          },
        },
      });
    }

    if (
      body.Password ===
      (await this.#parameters.GetParameter(Parameter.SERVER_ADMIN_PASSWORD))
    ) {
      return new Result(new EmptyResponse("Created"), {
        users: {
          [data.UserId]: {
            version: 1,
            joined_server: new Date(),
            last_logged_in: new Date(),
            admin: true,
            banned: false,
            role: null,
            policies: [],
          },
        },
      });
    }

    return new Result(new EmptyResponse("Unauthorised"));
  }
}
