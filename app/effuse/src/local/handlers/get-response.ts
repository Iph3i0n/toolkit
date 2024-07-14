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

export default class GetTopic extends Handler {
  readonly #channel_service: ChannelService;

  constructor(channel_service?: ChannelService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url =
    "/api/v1/channels/:channel_id/topics/:topic_id/responses/:response_id";

  async Process(request: PureRequest) {
    const { channel_id, topic_id, response_id } = request.Parameters({
      channel_id: IsString,
      topic_id: IsString,
      response_id: IsString,
    });
    await this.#channel_service.RequireWrite(request, channel_id);

    const items = this.State.forum_topic_lists[channel_id];
    if (!items || !items.topics.find((t) => t.id === topic_id))
      return new EmptyResponse("NotFound");
    const topic = this.State.forum_topics[topic_id];
    if (!topic || !topic.responses.find((t) => t === response_id))
      return new EmptyResponse("NotFound");

    const response = this.State.forum_responses[response_id];
    if (!response) return new EmptyResponse("NotFound");

    return new JsonResponse("Ok", {
      Id: response_id,
      Text: response.text,
      Who: response.who,
      When: response.when.toISOString(),
    });
  }
}
