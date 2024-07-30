import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { Handler } from "local/server";
import { ChannelService } from "local/services/channel-service";

export default class GetEvents extends Handler {
  readonly #channel_service: ChannelService;

  constructor(channel_service?: ChannelService) {
    super();
    this.#channel_service = channel_service ?? NewChannelService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/channels/:channel_id/events/:month";

  async Process(request: PureRequest) {
    const { channel_id, month } = request.Parameters({
      channel_id: IsString,
      month: IsString,
    });
    await this.#channel_service.RequireRead(request, channel_id);

    const data = this.State.calendar_event_lists[`${channel_id}-${month}`];

    if (!data) return new JsonResponse("Ok", []);

    return new JsonResponse(
      "Ok",
      data.events
        .map((e) => this.State.calendar_events[e])
        .map((e) => ({
          Title: e.title,
          Description: e.description,
          Organiser: e.organiser,
          Created: e.created.toISOString(),
          Attending: e.attending,
        }))
    );
  }
}
