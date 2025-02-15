import { Request } from "express";
import { Handler } from "handler";
import Path from "path";
import { FileResponse } from "response";

@Handler
export default class PageHandler {
  async Handle(request: Request) {
    return new FileResponse(Path.resolve(__dirname, "index.html"));
  }
}
