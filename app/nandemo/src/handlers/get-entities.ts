import Entity from "domain/entity";
import { Handler, IHandler } from "handler";
import Request from "request";
import { JsonResponse } from "response";

@Handler("/entities", "get")
export default class Controller implements IHandler {
  async Handle(request: Request) {
    const results = Entity.Children();

    return new JsonResponse(
      200,
      results.map((r) => r.Id)
    );
  }
}
