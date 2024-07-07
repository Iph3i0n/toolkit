import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { IParameterClient } from "integrations/i-parameter-client";
import { NewParameterClient } from "local/bootstrap/integrations/parameter-client";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class GetInviteLink extends Handler {
  readonly #auth_service: AuthService;
  readonly #parameters: IParameterClient;

  constructor(auth_service?: AuthService, parameters?: IParameterClient) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
    this.#parameters = parameters ?? NewParameterClient(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/invite-link";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { publicurl, embedded_role, admin } = request.Parameters({
      publicurl: IsString,
      embedded_role: IsString,
    });

    const url = new URL("", process.env.UI_URL);
    url.searchParams.set("action", "join");
    url.searchParams.set("server_url", publicurl);
    if (embedded_role) {
      const role = this.State.roles[embedded_role];
      if (!role) return new EmptyResponse("NotFound");
      url.searchParams.set("password", role.password);
    }

    return new JsonResponse("Created", { Url: url.href });
  }
}
