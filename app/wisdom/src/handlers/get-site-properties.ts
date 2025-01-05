import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler } from "server";
import { Authenticated } from "utils/authenticate";

export default class extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/site-properties";

  @Authenticated
  async Process(request: PureRequest) {
    const result: Record<string, string> = {};

    for (const [id, value] of this.State.properties) result[id] = value;
    return new JsonResponse("Ok", result);
  }
}
