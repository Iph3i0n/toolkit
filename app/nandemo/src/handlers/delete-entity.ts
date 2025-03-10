import Entity from "domain/entity";
import { Handler, IHandler } from "handler";
import Request from "request";
import Response, { EmptyResponse, JsonResponse } from "response";

@Handler("/entities/:id", "delete")
export default class Controller implements IHandler {
  async Handle(request: Request): Promise<Response> {
    const id = request.Param("id");
    if (!id) return new EmptyResponse(404);

    try {
      const result = new Entity(parseInt(id));

      Entity.Delete(result);

      return new JsonResponse(204, {
        deleted: true,
      });
    } catch (err) {
      console.error(err);
      return new EmptyResponse(404);
    }
  }
}
