import Entity from "domain/entity";
import { Handler, IHandler } from "handler";
import Request from "request";
import { EmptyResponse, JsonResponse } from "response";

@Handler("/entities/:id/children", "get")
export default class Controller implements IHandler {
  async Handle(request: Request) {
    const entity_id = request.Param("id");
    if (!entity_id) return new EmptyResponse(404);
    const results = Entity.Children(new Entity(parseInt(entity_id)));

    return new JsonResponse(
      200,
      results.map((r) => r.Id)
    );
  }
}
