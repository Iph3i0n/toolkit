import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";
import { ChannelService } from "local/services/channel-service";

export default class PutTopicResponse extends Handler {
  readonly #channel_service: ChannelService;
  readonly #auth_service: AuthService;

  constructor(channel_service?: ChannelService, auth_service?: AuthService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Put;
  readonly Url =
    "/api/v1/channels/:channel_id/topics/:topic_id/responses/:response_id";

  async Process(request: PureRequest) {
    const { channel_id, topic_id, response_id } = request.Parameters({
      channel_id: IsString,
      topic_id: IsString,
      response_id: IsString,
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
    if (!topic || !topic.responses.find((t) => t === response_id))
      return new EmptyResponse("NotFound");

    const existing = this.State.forum_responses[response_id];
    if (!existing) return new EmptyResponse("NotFound");
    if (existing.who !== user_id) return new EmptyResponse("Unauthorised");

    return new Result(
      new JsonResponse("Created", {
        Id: response_id,
        Text: body.text,
        Who: user_id,
        When: now.toISOString(),
      }),
      {
        forum_responses: {
          [response_id]: {
            ...existing,
            text: body.text,
          },
        },
      }
    );
  }
}
