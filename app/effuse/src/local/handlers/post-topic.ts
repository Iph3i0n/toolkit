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

export default class PostTopic extends Handler {
  readonly #channel_service: ChannelService;
  readonly #auth_service: AuthService;

  constructor(channel_service?: ChannelService, auth_service?: AuthService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/channels/:channel_id/topics";

  async Process(request: PureRequest) {
    const { channel_id } = request.Parameters({ channel_id: IsString });
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
    const id = Guid();
    const now = new Date();
    const existing = this.State.forum_topic_lists[channel_id];
    if (!existing) return new EmptyResponse("NotFound");

    return new Result(
      new JsonResponse("Created", {
        Id: id,
        Title: body.title,
        Text: body.text,
        Who: user_id,
        Created: now.toISOString(),
        Updated: now.toISOString(),
        Responses: [],
      }),
      {
        forum_topics: {
          [id]: {
            version: 1,
            title: body.title,
            text: body.text,
            who: user_id,
            created: now,
            updated: now,
            responses: [],
          },
        },
        forum_topic_lists: {
          [channel_id]: {
            version: 1,
            topics: [
              ...(existing.topics ?? []),
              { id, pinned: body.pinned, when: now, title: body.title },
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
