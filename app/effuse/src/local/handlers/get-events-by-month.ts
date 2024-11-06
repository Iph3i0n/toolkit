import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { RequireChannel } from "local/authorise";
import { Handler } from "local/server";

@RequireChannel("read")
export default class GetEvents extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/channels/:channel_id/events-by-month/:month";

  async Process(request: PureRequest) {
    const { channel_id, month } = request.Parameters({
      channel_id: IsString,
      month: IsString,
    });

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
          When: e.when.toISOString(),
        }))
    );
  }
}
