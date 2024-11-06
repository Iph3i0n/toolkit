import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { RequireChannel } from "local/authorise";
import { NewMessageService } from "local/bootstrap/services/message-service";
import { Handler } from "local/server";
import { MessageService } from "local/services/message-service";

@RequireChannel("read")
export default class GetMessages extends Handler {
  readonly #message_service: MessageService;

  constructor(message_service?: MessageService) {
    super();
    this.#message_service = message_service ?? NewMessageService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/channels/:channel_id/messages";

  async Process(request: PureRequest) {
    const { channel_id, offset } = request.Parameters({
      channel_id: IsString,
      offset: IsString,
    });

    const result = this.#message_service.Range(channel_id, BigInt(offset));

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
