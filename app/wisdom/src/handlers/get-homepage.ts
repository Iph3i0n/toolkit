import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler } from "server";

export default class GetHomepage extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/layout/homepage";

  async Process(request: PureRequest) {
    for (const [id, match] of this.State.pages) {
      if (match.parent) continue;
      return new JsonResponse("Ok", { id });
    }

    return new EmptyResponse("NotFound");
  }
}
