import { NewAuthService } from "sso/bootstrap/services/auth-service";
import { AuthService } from "sso/services/auth-service";
import { Handler, Result } from "sso/server";
import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import Axios from "axios";
import { v4 as Guid } from "uuid";

export default class PostServer extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
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
        RoleToken: IsString,
      })
    );

    await Axios.post(
      "/api/v1/users",
      {
        ServerToken: body.ServerToken,
        RoleToken: body.RoleToken,
      },
      {
        baseURL: body.ServerUrl,
      }
    );

    return new Result(new JsonResponse("Ok", { Success: true }), {
      users: {
        [user_id]: {
          ...user,
          servers: [
            ...user.servers,
            { id: Guid(), url: body.ServerUrl, joined_at: new Date() },
          ],
        },
      },
    });
  }
}
