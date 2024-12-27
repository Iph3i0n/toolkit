import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler } from "server";

export default class GetPages extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/pages";

  async Process(request: PureRequest) {
    return new JsonResponse(
      "Ok",
      this.State.pages
        .Filter((_, p) => p.parent === null)
        .map(([id, p]) => ({ id, slug: p.slug }))
    );
  }
}
