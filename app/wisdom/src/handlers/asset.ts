import { FileResponse, HttpMethod, PureRequest } from "@ipheion/puristee";
import { Handler } from "server";
import Path from "path";

export default class MainPage extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/_/**";

  Process(request: PureRequest) {
    return new FileResponse(
      Path.resolve(__dirname, "../..", ...request.parameters.slug)
    );
  }
}
