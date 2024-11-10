import { FileResponse, HttpMethod, PureRequest } from "@ipheion/puristee";
import Path from "node:path";
import { Handler } from "server";

export default class Index extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/";

  Process(request: PureRequest) {
    return new FileResponse(Path.resolve(__dirname, "../../assets/index.html"));
  }
}
