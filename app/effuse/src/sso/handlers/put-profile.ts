import { IProfilePicture } from "sso/integrations/i-profile-picture";
import { NewProfilePicture } from "sso/bootstrap/integrations/profile-picture";
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
  readonly #profile_picture: IProfilePicture;

  constructor(
    state: State,
    auth_service: AuthService = NewAuthService(state),
    profile_picture: IProfilePicture = NewProfilePicture(state)
  ) {
    super(state);
    this.#auth_service = auth_service;
    this.#profile_picture = profile_picture;
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

    await this.#profile_picture.SavePicture(
      user_id,
      body.Picture.MimeType,
      body.Picture.Base64Data
    );

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
      }
    );
  }
}
