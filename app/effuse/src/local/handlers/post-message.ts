import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { NewMessageService } from "local/bootstrap/services/message-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";
import { ChannelService } from "local/services/channel-service";
import { MessageService } from "local/services/message-service";

export default class PostMessage extends Handler {
  readonly #channel_service: ChannelService;
  readonly #message_service: MessageService;
  readonly #auth_service: AuthService;

  constructor(
    channel_service?: ChannelService,
    message_service?: MessageService,
    auth_service?: AuthService
  ) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
    this.#message_service = message_service ?? NewMessageService(this.State);
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/channels/:channel_id/messages";

  async Process(request: PureRequest) {
    const body = request.Body(IsObject({ Text: IsString }));
    const { channel_id } = request.Parameters({ channel_id: IsString }) ?? {};
    if (!channel_id || !body) return new EmptyResponse("BadRequest");

    const { user_id } = await this.#auth_service.GetUser(request);
    if (
      !(await this.#channel_service.MayWrite(request, channel_id)) ||
      !user_id
    )
      return new EmptyResponse("Unauthorised");

    const { data, name, count } = this.#message_service.Latest(channel_id);
    if (!data) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("Ok", { Message: "Message Sent" }), {
      messages: {
        [name]: [
          ...data,
          {
            version: 1,
            text: body.Text,
            when: new Date(),
            user: user_id,
          },
        ],
      },
      message_counts: {
        [channel_id]: count + 1n,
      },
    });
  }
}
