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

export default class PostAdminRole extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/admin-roles";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { RoleId } = request.Body(IsObject({ RoleId: IsString }));
    const role = this.State.roles[RoleId];
    if (!role) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("Created", { Message: "Success" }), {
      roles: {
        [RoleId]: {
          ...role,
          admin: true,
        },
      },
    });
  }
}
