import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler } from "server";
import { Authenticated } from "utils/authenticate";

export default class extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/layout/media-root";

  @Authenticated
  async Process(request: PureRequest) {
    for (const [id, match] of this.State.media) {
      if (match.parent) continue;

      return new JsonResponse("Ok", { id });
    }

    return new EmptyResponse("NotFound");
  }
}
