import { HttpMethod, PureRequest } from "@ipheion/puristee";
import { EjsResponse } from "response";
import { Handler } from "server";

export default class Home extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/";

  Process(request: PureRequest) {
    return new EjsResponse("home", {});
  }
}
