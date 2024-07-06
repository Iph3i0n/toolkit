import { EmptyResponse, IResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { Result, WebSocketHandler } from "local/server";
import { ChannelService } from "local/services/channel-service";

export default class WebSocketChat extends WebSocketHandler {
  readonly #channel_service: ChannelService;

  constructor(channel_service?: ChannelService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
  }

  readonly Url = "/ws/chat/:channel_id";

  async #authorised(request: PureRequest) {
    const { token, channel_id } = request.Parameters({
      token: IsString,
      channel_id: IsString,
    });

    if (!token || !channel_id) return undefined;

    if (!this.#channel_service.MayRead(request, channel_id)) return undefined;

    return channel_id;
  }

  async OnConnect(request: PureRequest) {
    const channel_id = await this.#authorised(request);
    if (!channel_id) return new EmptyResponse("Unauthorised");

    return new Result(new EmptyResponse("Ok"), {
      channel_subscriptions: {
        [channel_id]: [
          ...(this.State.channel_subscriptions[channel_id] ?? []),
          request.request_id,
        ],
      },
    });
  }

  async OnClose(request: PureRequest) {
    const channel_id = await this.#authorised(request);
    if (!channel_id) return new EmptyResponse("Unauthorised");
    const existing = this.State.channel_subscriptions[channel_id];

    return new Result(new EmptyResponse("Ok"), {
      channel_subscriptions: {
        [channel_id]: existing.filter((e) => e !== request.request_id),
      },
    });
  }
}
