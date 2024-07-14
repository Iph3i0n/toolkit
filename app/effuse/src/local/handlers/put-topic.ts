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

export default class PutTopic extends Handler {
  readonly #channel_service: ChannelService;
  readonly #auth_service: AuthService;

  constructor(channel_service?: ChannelService, auth_service?: AuthService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/channels/:channel_id/topics/:topic_id";

  async Process(request: PureRequest) {
    const { channel_id, topic_id } = request.Parameters({
      channel_id: IsString,
      topic_id: IsString,
    });
    await this.#channel_service.RequireWrite(request, channel_id);
    const { user_id } = await this.#auth_service.GetUser(request);
    if (!user_id) return new EmptyResponse("Unauthorised");

    const body = request.Body(
      IsObject({
        title: IsString,
        text: IsString,
        pinned: IsBoolean,
      })
    );
    const now = new Date();
    const items = this.State.forum_topic_lists[channel_id];
    if (!items || !items.topics.find((t) => t.id === topic_id))
      return new EmptyResponse("NotFound");
    const topic = this.State.forum_topics[topic_id];
    if (!topic) return new EmptyResponse("NotFound");
    if (topic.who !== user_id) return new EmptyResponse("Unauthorised");

    return new Result(
      new JsonResponse("Ok", {
        Id: topic_id,
        Title: body.title,
        Text: body.text,
        Who: user_id,
        Created: topic.created.toISOString(),
        Updated: now.toISOString(),
        Responses: [],
      }),
      {
        forum_topics: {
          [topic_id]: {
            version: 1,
            title: body.title,
            text: body.text,
            who: topic.who,
            created: topic.created,
            updated: now,
            responses: topic.responses,
          },
        },
        forum_topic_lists: {
          [channel_id]: {
            version: 1,
            topics: [
              ...(items.topics ?? []).filter((t) => t.id !== topic_id),
              {
                id: topic_id,
                pinned: body.pinned,
                when: topic.created,
                title: body.title,
              },
            ].sort((a, b) => {
              if (a.pinned && b.pinned)
                return a.when.getTime() - b.when.getTime();
              if (a.pinned) return -1;
              if (b.pinned) return 1;

              return a.when.getTime() - b.when.getTime();
            }),
          },
        },
      }
    );
  }
}
