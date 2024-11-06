import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { RequireAdmin } from "local/authorise";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler } from "local/server";
import { AuthService } from "local/services/auth-service";

@RequireAdmin
export default class GetInviteLink extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/invite-link";

  async Process(request: PureRequest) {
    const { role_id } = request.Parameters({ role_id: IsString });

    return new JsonResponse("Created", {
      Url: await this.#auth_service.CreateInviteUrl(role_id),
    });
  }
}
