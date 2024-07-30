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
import { v4 as Guid } from "uuid";

export default class PostEvent extends Handler {
  readonly #channel_service: ChannelService;
  readonly #auth_service: AuthService;

  constructor(channel_service?: ChannelService, auth_service?: AuthService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/channels/:channel_id/events";

  async Process(request: PureRequest) {
    const { user_id } = await this.#auth_service.GetUser(request);
    if (!user_id) return new EmptyResponse("Unauthorised");
    const { channel_id } = request.Parameters({ channel_id: IsString });
    await this.#channel_service.RequireWrite(request, channel_id);

    const body = request.Body(
      IsObject({ Title: IsString, Description: IsString, When: IsString })
    );

    const when = new Date(body.When);

    const [year, month] = body.When.split("T")[0].split("-");
    const directory = `${channel_id}-${year}-${month}`;

    const data = this.State.calendar_event_lists[directory];
    const id = Guid();

    return new Result(new JsonResponse("Ok", {}), {
      calendar_event_lists: {
        [directory]: {
          version: 1,
          events: [...(data?.events ?? []), id],
        },
      },
      calendar_events: {
        [id]: {
          version: 1,
          title: body.Title,
          description: body.Description,
          organiser: user_id,
          when: when,
          created: new Date(),
          attending: [],
        },
      },
    });
  }
}
