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

export default class PostEvent extends Handler {
  readonly #channel_service: ChannelService;
  readonly #auth_service: AuthService;

  constructor(channel_service?: ChannelService, auth_service?: AuthService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/channels/:channel_id/events/:id";

  async Process(request: PureRequest) {
    const { user_id } = await this.#auth_service.GetUser(request);
    if (!user_id) return new EmptyResponse("Unauthorised");
    const { channel_id, id } = request.Parameters({
      channel_id: IsString,
      id: IsString,
    });
    await this.#channel_service.RequireWrite(request, channel_id);

    const body = request.Body(
      IsObject({ Title: IsString, Description: IsString, When: IsString })
    );

    return new Result(new JsonResponse("Ok", {}), {
      calendar_events: {
        [id]: {
          version: 1,
          title: body.Title,
          description: body.Description,
          organiser: user_id,
          when: new Date(body.When),
          created: new Date(),
          attending: [],
        },
      },
    });
  }
}
