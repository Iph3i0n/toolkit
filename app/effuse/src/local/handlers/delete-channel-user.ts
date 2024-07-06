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

export default class DeleteChannelUser extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Delete;
  readonly Url = "/api/v1/channels/:channel_id/users/:user_id";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { channel_id, user_id } = request.Parameters({
      channel_id: IsString,
      user_id: IsString,
    });

    const existing = this.State.users[user_id];
    if (!existing) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("NoContent", { Message: "Success" }), {
      users: {
        [user_id]: {
          ...existing,
          policies: existing.policies.filter(
            (p) => p.channel_id !== channel_id
          ),
        },
      },
    });
  }
}
