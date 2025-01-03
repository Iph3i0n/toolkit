import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler } from "server";
import { Authenticated } from "utils/authenticate";

export default class extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/pages";

  @Authenticated
  async Process(request: PureRequest) {
    return new JsonResponse(
      "Ok",
      this.State.pages
        .Filter((_, p) => p.parent === null)
        .map(([id, p]) => ({ id, slug: p.slug }))
    );
  }
}
