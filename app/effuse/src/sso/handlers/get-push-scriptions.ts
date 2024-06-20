import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler, Result, State } from "../server";
import { NewAuthService } from "$sso/b/services/auth-service";
import { AuthService } from "$sso/s/auth-service";

export default class GetPushSubscriptions extends Handler {
  readonly #auth_service: AuthService;

  constructor(state: State, auth_service: AuthService = NewAuthService(state)) {
    super(state);
    this.#auth_service = auth_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/user/push-subscriptions";

  async Process(request: PureRequest) {
    const user = await this.#auth_service.GetAdminUser(request);
    if (!user) return new Result(new EmptyResponse("NotFound"));

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
