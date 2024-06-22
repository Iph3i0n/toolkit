import { NewAuthService } from "sso/bootstrap/services/auth-service";
import { AuthService } from "sso/services/auth-service";
import { Handler, Result, State } from "sso/server";
import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import Axios from "axios";

export default class PostServer extends Handler {
  readonly #auth_service: AuthService;

  constructor(state: State, auth_service: AuthService = NewAuthService(state)) {
    super(state);
    this.#auth_service = auth_service;
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/user/servers";

  async Process(request: PureRequest) {
    const [user, user_id] = await this.#auth_service.GetAdminUser(request);
    if (!user) return new Result(new EmptyResponse("NotFound"));

    const body = request.Body(
      IsObject({
        ServerToken: IsString,
        ServerUrl: IsString,
        Password: IsString,
      })
    );

    if (!body) return new Result(new EmptyResponse("BadRequest"));

    await Axios.post("/api/v1/users", {
      baseURL: body.ServerUrl,
      data: {
        ServerToken: body.ServerToken,
        Password: body.Password,
      },
    });

    return new Result(new JsonResponse("Ok", { Success: true }), {
      users: {
        [user_id]: {
          ...user,
          servers: [
            ...user.servers,
            { url: body.ServerUrl, joined_at: new Date() },
          ],
        },
      },
    });
  }
}
