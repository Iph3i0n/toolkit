import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { Handler } from "local/server";
import { ChannelService } from "local/services/channel-service";

export default class GetTopics extends Handler {
  readonly #channel_service: ChannelService;

  constructor(channel_service?: ChannelService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/channels/:channel_id/topics";

  async Process(request: PureRequest) {
    const { channel_id } = request.Parameters({ channel_id: IsString });
    await this.#channel_service.RequireRead(request, channel_id);

    const items = this.State.forum_topic_lists[channel_id];
    if (!items) return new EmptyResponse("NotFound");

    return new JsonResponse(
      "Ok",
      items.topics.map((t) => ({
        Id: t.id,
        Pinned: t.pinned,
        When: t.when.toISOString(),
        Title: t.title,
      }))
    );
  }
}
