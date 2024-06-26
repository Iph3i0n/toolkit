import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler, Result, State } from "../server";
import { NewAuthService } from "sso/bootstrap/services/auth-service";
import { AuthService } from "sso/services/auth-service";

export default class GetPushSubscriptions extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/user/push-subscriptions";

  async Process(request: PureRequest) {
    const [user] = await this.#auth_service.GetAdminUser(request);
    if (!user) return new Result(new EmptyResponse("Unauthorised"));

    return new Result(
      new JsonResponse(
        "Ok",
        user.push_subscriptions.map((s) => ({
          Endpoint: s.endpoint,
          Expires: s.expires.toISOString(),
          Keys: s.parameters,
        }))
      )
    );
  }
}
