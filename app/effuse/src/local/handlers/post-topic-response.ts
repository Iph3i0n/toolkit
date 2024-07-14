import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsBoolean, IsObject, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";
import { ChannelService } from "local/services/channel-service";
import { v4 as Guid } from "uuid";

export default class PostTopicResponse extends Handler {
  readonly #channel_service: ChannelService;
  readonly #auth_service: AuthService;

  constructor(channel_service?: ChannelService, auth_service?: AuthService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/channels/:channel_id/topics/:topic_id/responses";

  async Process(request: PureRequest) {
    const { channel_id, topic_id } = request.Parameters({
      channel_id: IsString,
      topic_id: IsString,
    });
    await this.#channel_service.RequireWrite(request, channel_id);
    const { user_id } = await this.#auth_service.GetUser(request);
    if (!user_id) return new EmptyResponse("Unauthorised");

    const body = request.Body(IsObject({ text: IsString }));
    const now = new Date();
    const items = this.State.forum_topic_lists[channel_id];
    if (!items || !items.topics.find((t) => t.id === topic_id))
      return new EmptyResponse("NotFound");
    const topic = this.State.forum_topics[topic_id];
    if (!topic) return new EmptyResponse("NotFound");

    const id = Guid();

    return new Result(
      new JsonResponse("Created", {
        Id: id,
        Text: body.text,
        Who: user_id,
        When: now.toISOString(),
      }),
      {
        forum_topics: {
          [topic_id]: {
            ...topic,
            responses: [...topic.responses, id],
          },
        },
        forum_responses: {
          [id]: {
            version: 1,
            text: body.text,
            who: user_id,
            when: now,
          },
        },
      }
    );
  }
}
