import Entity from "domain/entity";
import { Handler, IHandler } from "handler";
import Request from "request";
import { JsonResponse } from "response";

@Handler("/entities", "get")
@Handler("/entities/:entity_id/children", "get")
export default class Controller implements IHandler {
  async Handle(request: Request) {
    const entity_id = request.Param("entity");
    const results = Entity.Children(
      entity_id ? new Entity(parseInt(entity_id)) : undefined
    );

    return new JsonResponse(
      200,
      results.map((r) => ({
        id: r.Id,
        name: r.Name,
        quantity: r.Quantity,
        url: r.Url,
        img: r.Img,
        container: r.Container
          ? { id: r.Container.Id, name: r.Container.Name }
          : undefined,
        category: r.Category
          ? { id: r.Category.Id, name: r.Category.Name }
          : undefined,
        tags: r.Tags.map((t) => ({ id: t.Id, name: t.Name })),
        comment: r.Comment,
      }))
    );
  }
}
