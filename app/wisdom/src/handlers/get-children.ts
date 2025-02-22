import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { Handler } from "server";
import { Authenticated } from "utils/authenticate";

export default class extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/pages/:id/children";

  @Authenticated
  async Process(request: PureRequest) {
    const { id } = request.Parameters({ id: IsString });
    return new JsonResponse(
      "Ok",
      this.State.pages
        .Filter((_, p) => p.parent === id)
        .map(([id, p]) => ({ id, ...p }))
    );
  }
}
