import Category from "domain/category";
import Entity from "domain/entity";
import Tag from "domain/tag";
import { Handler, IHandler } from "handler";
import Request from "request";
import { JsonResponse } from "response";

@Handler("/entities", "get")
export default class Controller implements IHandler {
  async Handle(request: Request) {
    const category = request.Param("category");
    const tags = request.Param("tags");
    const require_all_tags = request.Param("require_all_tags");
    const term = request.Param("term");

    if (category || tags || term) {
      return new JsonResponse(
        200,
        Entity.Search({
          category: category ? new Category(parseInt(category)) : undefined,
          tags:
            tags
              ?.split(",")
              .filter((t) => t.trim())
              .map((t) => new Tag(t.trim())) ?? [],
          require_all_tags: require_all_tags === "true",
          term,
        }).map((r) => r.Id)
      );
    }

    return new JsonResponse(
      200,
      Entity.Children().map((r) => r.Id)
    );
  }
}
