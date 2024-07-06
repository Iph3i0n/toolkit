import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsBoolean, IsObject, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class DeleteRoleChannel extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Delete;
  readonly Url = "/api/v1/roles/:role_id/channels/:channel_id";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { role_id, channel_id } = request.Parameters({
      role_id: IsString,
      channel_id: IsString,
    });

    const existing = this.State.roles[role_id];
    if (!existing) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("NoContent", { Message: "Success" }), {
      roles: {
        [role_id]: {
          ...existing,
          policies: existing.policies.filter(
            (p) => p.channel_id !== channel_id
          ),
        },
      },
    });
  }
}
