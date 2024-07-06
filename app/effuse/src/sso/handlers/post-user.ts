import { NewAuthService } from "sso/bootstrap/services/auth-service";
import { AuthService } from "sso/services/auth-service";
import { Handler, Result, State } from "sso/server";
import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import { v4 as Guid } from "uuid";

export default class PostUser extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/users";

  async Process(request: PureRequest) {
    const body = request.Body(
      IsObject({
        UserName: IsString,
        Email: IsString,
        Password: IsString,
      })
    );

    const existing = this.State.user_emails[body.Email];
    if (existing) return new Result(new EmptyResponse("Conflict"));

    const encrypted_password = await this.#auth_service.EncryptPassword(
      body.Password
    );

    const user_id = Guid();
    const grant = await this.#auth_service.CreateGrant(user_id);

    return new Result(
      new JsonResponse("Created", {
        AdminToken: grant.UserToken,
        ServerToken: grant.ServerToken,
        UserId: grant.UserId,
        RefreshToken: grant.RefreshToken,
        Expires: grant.Expires.toISOString(),
      }),
      {
        user_emails: {
          [body.Email]: { user_id, version: 1 },
        },
        users: {
          [user_id]: {
            version: 1,
            username: body.UserName,
            email: body.Email,
            encrypted_password: encrypted_password,
            registered_at: new Date(),
            last_sign_in: new Date(),
            servers: [],
            biography: "",
            push_subscriptions: [],
          },
        },
      }
    );
  }
}
