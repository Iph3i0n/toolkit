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

export default class PutProfile extends Handler {
  readonly #auth_service: AuthService;

  constructor(state: State, auth_service: AuthService = NewAuthService(state)) {
    super(state);
    this.#auth_service = auth_service;
  }

  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/user/profile";

  async Process(request: PureRequest) {
    const body = request.Body(
      IsObject({
        UserName: IsString,
        Biography: IsString,
        Picture: IsObject({
          Base64Data: IsString,
          MimeType: IsString,
        }),
      })
    );

    if (!body) return new Result(new EmptyResponse("BadRequest"));

    const [user, user_id] = await this.#auth_service.GetAdminUser(request);
    if (!user) return new Result(new EmptyResponse("NotFound"));

    const buffer = Buffer.from(body.Picture.Base64Data, "base64");

    return new Result(
      new JsonResponse("Ok", {
        UserId: user_id,
        Email: user.email,
        UserName: user.username,
        Biography: body.Biography,
        RegisteredAt: user.registered_at.toISOString(),
        LastSignIn: user.last_sign_in.toISOString(),
        Servers: user.servers.map((s) => ({
          Url: s.url,
          JoinedAt: s.joined_at.toISOString(),
        })),
      }),
      {
        users: {
          [user_id]: {
            ...user,
            biography: body.Biography,
          },
        },
        pictures: {
          [user_id]: {
            mime: body.Picture.MimeType,
            data: buffer,
          },
        },
      }
    );
  }
}
