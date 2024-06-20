import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler, Result } from "$sso/server";

export default class HeartBeat extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/heartbeat";

  Process(request: PureRequest) {
    return new Result(new JsonResponse("Ok", { Text: "Hello world" }));
  }
}
