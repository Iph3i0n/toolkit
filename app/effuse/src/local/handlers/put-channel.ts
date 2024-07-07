import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsBoolean, IsObject, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class PutChannel extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/channels/:channel_id";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const { channel_id } = request.Parameters({ channel_id: IsString });
    const body = request.Body(IsObject({ Name: IsString, Public: IsBoolean }));

    const existing = this.State.channels[channel_id];
    if (!existing) return new EmptyResponse("NotFound");

    return new Result(
      new JsonResponse("Created", {
        ChannelId: channel_id,
        Type: existing.type,
        Name: body.Name,
        Public: body.Public,
      }),
      {
        channels: {
          [channel_id]: {
            ...existing,
            name: body.Name,
          },
        },
      }
    );
  }
}
