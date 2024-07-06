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

export default class PostChannelUser extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/channels/:channel_id/users";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { channel_id } = request.Parameters({ channel_id: IsString });
    const body = request.Body(
      IsObject({ UserId: IsString, AllowWrite: IsBoolean })
    );

    const existing = this.State.users[body.UserId];
    if (!existing) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("Created", { Message: "Success" }), {
      users: {
        [body.UserId]: {
          ...existing,
          policies: [
            ...existing.policies,
            {
              channel_id,
              access: body.AllowWrite ? "Write" : "Read",
            },
          ],
        },
      },
    });
  }
}
