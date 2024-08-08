import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";
import { ChannelService } from "local/services/channel-service";

export default class PostParticipant extends Handler {
  readonly #channel_service: ChannelService;
  readonly #auth_service: AuthService;

  constructor(channel_service?: ChannelService, auth_service?: AuthService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/channels/:channel_id/events/:id/participants";

  async Process(request: PureRequest) {
    const { user_id } = await this.#auth_service.GetUser(request);
    if (!user_id) return new EmptyResponse("Unauthorised");
    const { channel_id, id } = request.Parameters({
      channel_id: IsString,
      id: IsString,
    });
    await this.#channel_service.RequireRead(request, channel_id);

    const existing = this.State.calendar_events[id];
    if (!existing) return new EmptyResponse("NotFound");
    return new Result(new JsonResponse("Created", {}), {
      calendar_events: {
        [id]: {
          ...existing,
          attending: [...existing.attending, user_id],
        },
      },
    });
  }
}
