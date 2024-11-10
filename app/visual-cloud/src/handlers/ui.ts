import { FileResponse, HttpMethod, PureRequest } from "@ipheion/puristee";
import Path from "node:path";
import { Handler } from "server";

export default class Index extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/ui.js";

  Process(request: PureRequest) {
    return new FileResponse(Path.resolve(__dirname, "../ui.out.js"));
  }
}
