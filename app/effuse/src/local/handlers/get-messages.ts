import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { NewMessageService } from "local/bootstrap/services/message-service";
import { Message } from "local/models/message";
import { Handler } from "local/server";
import { ChannelService } from "local/services/channel-service";
import { MessageService } from "local/services/message-service";

export default class GetMessages extends Handler {
  readonly #channel_service: ChannelService;
  readonly #message_service: MessageService;

  constructor(
    channel_service?: ChannelService,
    message_service?: MessageService
  ) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
    this.#message_service = message_service ?? NewMessageService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/channels/:channel_id/messages";

  async Process(request: PureRequest) {
    const { channel_id, offset } =
      request.Parameters({ channel_id: IsString, offset: IsString }) ?? {};
    if (!channel_id || !offset) return new EmptyResponse("BadRequest");
    if (!(await this.#channel_service.MayRead(request, channel_id)))
      return new EmptyResponse("Unauthorised");

    const { data, start, finish } = this.#message_service.Range(
      channel_id,
      BigInt(offset)
    );
    if (!data) return new EmptyResponse("NotFound");

    const result: Array<Message> = [];
    for (let i = start; start >= finish; i--) {
      result.push(data[i]);
    }

    return new JsonResponse(
      "Ok",
      result.map((l) => ({
        Text: l.text,
        When: l.when.toISOString(),
        Who: l.user,
      }))
    );
  }
}
