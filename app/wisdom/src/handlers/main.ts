import { FileResponse, HttpMethod, PureRequest } from "@ipheion/puristee";
import { Handler } from "server";
import Path from "path";

export default class extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/**";

  Process(request: PureRequest) {
    return new FileResponse(Path.resolve(__dirname, "../../index.html"));
  }
}
