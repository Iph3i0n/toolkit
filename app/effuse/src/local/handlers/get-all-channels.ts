import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { Channel } from "local/models/channel";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";
import { ChannelService } from "local/services/channel-service";

export default class GetAllChannels extends Handler {
  readonly #auth_service: AuthService;
  readonly #channel_service: ChannelService;

  constructor(auth_service?: AuthService, channel_service?: ChannelService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
    this.#channel_service = channel_service ?? NewChannelService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/channels";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireUser(request);
    const result: Array<[string, Channel]> = [];

    for (const [id, channel] of this.State.channels)
      if (await this.#channel_service.MayRead(request, id))
        result.push([id, channel]);

    return new Result(
      new JsonResponse(
        "Ok",
        result.map(([i, c]) => ({
          ChannelId: i,
          Type: c.type,
          Name: c.name,
        }))
      )
    );
  }
}
