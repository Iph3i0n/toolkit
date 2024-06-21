import { NewAuthService } from "sso/bootstrap/services/auth-service";
import { AuthService } from "sso/services/auth-service";
import { Handler, Result, State } from "sso/server";
import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsDictionary, IsNumber, IsObject, IsString } from "@ipheion/safe-type";

export default class PostPushSubscription extends Handler {
  readonly #auth_service: AuthService;

  constructor(state: State, auth_service: AuthService = NewAuthService(state)) {
    super(state);
    this.#auth_service = auth_service;
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/user/push-subscriptions";

  async Process(request: PureRequest) {
    const body = request.Body(
      IsObject({
        Endpoint: IsString,
        Expires: IsNumber,
        Keys: IsDictionary(IsString),
      })
    );

    if (!body) return new Result(new EmptyResponse("BadRequest"));

    const [user, user_id] = await this.#auth_service.GetAdminUser(request);
    if (!user) return new Result(new EmptyResponse("Unauthorised"));

    return new Result(new JsonResponse("Created", { Message: "Success" }), {
      users: {
        [user_id]: {
          ...user,
          push_subscriptions: [
            ...user.push_subscriptions,
            {
              endpoint: body.Endpoint,
              expires: new Date(body.Expires),
              parameters: body.Keys,
            },
          ],
        },
      },
    });
  }
}
