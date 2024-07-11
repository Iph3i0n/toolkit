import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { v4 as Guid } from "uuid";
import { IsBoolean, IsObject, IsOneOf, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class PostChannel extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/channels";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const body = request.Body(
      IsObject({
        Name: IsString,
        Type: IsOneOf("Messages", "Forum", "Call", "Calendar"),
      })
    );

    const id = Guid();

    return new Result(
      new JsonResponse("Created", {
        ChannelId: id,
        Type: body.Type,
        Name: body.Name,
      }),
      {
        channels: {
          [id]: {
            version: 1,
            name: body.Name,
            type: body.Type,
          },
        },
        message_counts: {
          [id]: 0n,
        },
      }
    );
  }
}
