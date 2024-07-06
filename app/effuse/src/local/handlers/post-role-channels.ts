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

export default class PostRoleChannel extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/roles/:role_id/channels";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { role_id } = request.Parameters({ role_id: IsString });
    const body = request.Body(
      IsObject({ ChannelId: IsString, AllowWrite: IsBoolean })
    );

    const existing = this.State.roles[role_id];
    if (!existing) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("Created", { Message: "Success" }), {
      roles: {
        [role_id]: {
          ...existing,
          policies: [
            ...existing.policies,
            {
              channel_id: body.ChannelId,
              access: body.AllowWrite ? "Write" : "Read",
            },
          ],
        },
      },
    });
  }
}
