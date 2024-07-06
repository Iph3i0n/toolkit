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

export default class PutChannel extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/users/:user_id/role";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { user_id } = request.Parameters({ user_id: IsString });
    const body = request.Body(IsObject({ RoleId: IsString }));

    const existing = this.State.users[user_id];
    if (!existing) return new EmptyResponse("NotFound");

    if (!this.State.roles[body.RoleId]) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("Ok", { Message: "Success" }), {
      users: {
        [user_id]: {
          ...existing,
          role: body.RoleId,
        },
      },
    });
  }
}
