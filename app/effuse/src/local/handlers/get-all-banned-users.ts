import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class GetAllBannedUsers extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/banned-users";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);

    return new JsonResponse(
      "Ok",
      this.State.users
        .Filter((_, u) => u.banned)
        .map(([id]) => ({ UserId: id }))
    );
  }
}
