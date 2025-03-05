import Entity from "domain/entity";
import Tag from "domain/tag";
import { Handler, IHandler } from "handler";
import Request from "request";
import Response, { EmptyResponse, JsonResponse } from "response";

@Handler("/entities/:id", "get")
export default class Controller implements IHandler {
  #tag_name(tag: Tag): string {
    if (tag.Parent) return `${this.#tag_name(tag.Parent)}/${tag.Name}`;

    return tag.Name;
  }

  async Handle(request: Request): Promise<Response> {
    const id = request.Param("id");
    if (!id) return new EmptyResponse(404);

    try {
      const result = new Entity(parseInt(id));

      return new JsonResponse(200, {
        id: result.Id,
        name: result.Name,
        quantity: result.Quantity,
        url: result.Url,
        img: result.Img?.OriginalUrl,
        container: result.Container
          ? {
              id: result.Container.Id,
              name: result.Container.Name,
            }
          : undefined,
        category: result.Category
          ? {
              id: result.Category.Id,
              name: result.Category.Name,
            }
          : undefined,
        tags: result.Tags.map((t) => ({ id: t.Id, name: this.#tag_name(t) })),
        comment: result.Comment,
      });
    } catch (err) {
      console.error(err);
      return new EmptyResponse(404);
    }
  }
}
