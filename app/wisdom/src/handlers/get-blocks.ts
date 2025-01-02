import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler } from "server";

export default class extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/blocks";

  async Process(request: PureRequest) {
    return new JsonResponse(
      "Ok",
      this.State.blocks
        .Filter((_, b) => !!b.slug)
        .map(([id, b]) => ({ id, ...b }))
    );
  }
}
