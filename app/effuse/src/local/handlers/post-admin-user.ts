import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class PostAdminUser extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/admin-users";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { UserId } = request.Body(IsObject({ UserId: IsString }));
    const user = this.State.users[UserId];
    if (!user) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("Created", { Message: "Success" }), {
      users: {
        [UserId]: {
          ...user,
          admin: true,
        },
      },
    });
  }
}
