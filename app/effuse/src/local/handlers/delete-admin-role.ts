import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class DeleteAdminRole extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Delete;
  readonly Url = "/api/v1/admin-roles/:role_id";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { role_id } = request.Parameters({ role_id: IsString });
    const role = this.State.roles[role_id];
    if (!role) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("NoContent", { Message: "Success" }), {
      roles: {
        [role_id]: {
          ...role,
          admin: false,
        },
      },
    });
  }
}
