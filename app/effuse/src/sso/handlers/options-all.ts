import { CorsResponse, HttpMethod, PureRequest } from "@ipheion/puristee";
import { Handler, Result } from "sso/server";

export default class OptionsAll extends Handler {
  readonly Method = HttpMethod.Options;
  readonly Url = "**";

  async Process(request: PureRequest) {
    return new Result(new CorsResponse(process.env.UI_URL ?? "*"));
  }
}
