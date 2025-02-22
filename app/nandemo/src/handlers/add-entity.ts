import Category from "domain/category";
import Entity from "domain/entity";
import { Handler, IHandler } from "handler";
import { CreateEntityModel } from "models/entity";
import Request from "request";
import { JsonResponse } from "response";

@Handler("/entities", "post")
export default class Controller implements IHandler {
  async Handle(request: Request) {
    const data = request.Body(CreateEntityModel);
    new Entity(
      data.name,
      parseInt(data.quantity),
      data.url ?? undefined,
      data.img ?? undefined,
      data.container ? new Entity(data.container) : undefined,
      data.category ? new Category(data.category) : undefined,
      [],
      data.comment ?? undefined
    );
    return new JsonResponse(201, { created: true });
  }
}
