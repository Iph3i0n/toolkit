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

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/roles";

  async Process(request: PureRequest) {
    if (request.parameters.with_permissions) {
      await this.#auth_service.RequireAdmin(request);

      return new JsonResponse(
        "Ok",
        this.State.roles.Map((id, item) => ({
          RoleId: id,
          Name: item.name,
          Admin: item.admin,
          Password: item.password,
          Policies: item.policies.map((p) => ({
            ChannelId: p.channel_id,
            Write: p.access === "Write",
          })),
        }))
      );
    }

    await this.#auth_service.RequireUser(request);

    return new JsonResponse(
      "Ok",
      this.State.roles.Map((id, item) => ({
        RoleId: id,
        Name: item.name,
      }))
    );
  }
}
