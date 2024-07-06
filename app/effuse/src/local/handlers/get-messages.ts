import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { Channel } from "local/models/channel";
import { Message } from "local/models/message";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";
import { ChannelService } from "local/services/channel-service";

export default class GetMessages extends Handler {
  readonly #auth_service: AuthService;
  readonly #channel_service: ChannelService;

  constructor(auth_service?: AuthService, channel_service?: ChannelService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
    this.#channel_service = channel_service ?? NewChannelService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/channels/:channel_id/messages";

  static readonly #BundleSize = 200n;
  static readonly #LogsPerRequest = 20;

  #LogFileIndex(message_index: bigint) {
    return message_index / GetMessages.#BundleSize;
  }

  #Entry(channel_id: string, message_index: bigint) {
    return this.State.messages[
      `${channel_id}.${this.#LogFileIndex(message_index)}`
    ];
  }

  #LineNumber(message_index: bigint) {
    return Number(message_index % GetMessages.#BundleSize);
  }

  async Process(request: PureRequest) {
    const { channel_id, offset: offset_string } =
      request.Parameters({ channel_id: IsString, offset: IsString }) ?? {};
    if (!channel_id || !offset_string) return new EmptyResponse("BadRequest");
    if (!(await this.#channel_service.MayRead(request, channel_id)))
      return new EmptyResponse("Unauthorised");

    const offset = BigInt(offset_string);
    const count = this.State.message_counts[channel_id];
    if (offset <= count) return new EmptyResponse("NotFound");

    const message_index = count - offset - 1n;

    const logs = this.#Entry(channel_id, message_index);
    const start = this.#LineNumber(message_index);
    const result: Array<Message> = [];

    for (
      let i = start;
      start - i < GetMessages.#LogsPerRequest && i >= 0;
      i--
    ) {
      if (i >= logs.length) break;
      result.push(logs[i]);
    }

    return new JsonResponse(
      "Ok",
      logs.map((l) => ({
        Text: l.text,
        When: l.when.toISOString(),
        Who: l.user,
      }))
    );
  }
}
