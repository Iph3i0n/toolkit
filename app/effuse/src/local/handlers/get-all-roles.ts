import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class GetAllRoles extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/roles";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);

    return new JsonResponse(
      "Ok",
      this.State.roles.Map((id, item) => ({
        RoleId: id,
        Name: item.name,
        Admin: item.admin,
        Policies: item.policies.map((p) => ({
          ChannelId: p.channel_id,
          Write: p.access === "Write",
        })),
      }))
    );
  }
}
