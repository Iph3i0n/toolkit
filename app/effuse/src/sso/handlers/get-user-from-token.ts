import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler, State, Result } from "$sso/server";
import { NewAuthService } from "$sso/b/services/auth-service";
import { AuthService } from "$sso/s/auth-service";

export default class GetUserFromToken extends Handler {
  readonly #auth_service: AuthService;

  constructor(state: State, auth_service: AuthService = NewAuthService(state)) {
    super(state);
    this.#auth_service = auth_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/auth/user";

  async Process(request: PureRequest) {
    const user = await this.#auth_service.GetIdentifyUser(request);
    if (!user) return new Result(new EmptyResponse("NotFound"));
    return new Result(new JsonResponse("Ok", { UserId: user.user_id }));
  }
}
