import { Handler, IHandler } from "handler";
import Path from "path";
import Request from "request";
import { FileResponse } from "response";

@Handler("*", "get")
export default class Controller implements IHandler {
  async Handle(request: Request) {
    return new FileResponse(Path.resolve(__dirname, "../index.html"));
  }
}
