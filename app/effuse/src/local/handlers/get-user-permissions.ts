import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class GetAllRoles extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/user/:user_id/permissions";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { user_id } = request.Parameters({ user_id: IsString });
    const user = this.State.users[user_id];
    if (!user) return new EmptyResponse("NotFound");

    return new JsonResponse(
      "Ok",
      user.policies.map((p) => ({
        ChannelId: p.channel_id,
        Write: p.access === "Write",
      }))
    );
  }
}
