import Entity from "domain/entity";
import Tag from "domain/tag";
import { Handler, IHandler } from "handler";
import Request from "request";
import Response, { EmptyResponse, JsonResponse } from "response";

@Handler("/entities/:id/breadcrumbs", "get")
export default class Controller implements IHandler {
  #tag_name(tag: Tag): string {
    if (tag.Parent) return `${this.#tag_name(tag.Parent)}/${tag.Name}`;

    return tag.Name;
  }

  async Handle(request: Request): Promise<Response> {
    const id = request.Param("id");
    if (!id) return new EmptyResponse(404);

    try {
      let result = new Entity(parseInt(id));
      const crumbs = [result];
      while (result.Container) {
        result = result.Container;
        crumbs.push(result);
      }

      return new JsonResponse(
        200,
        crumbs.reverse().map((r) => r.Id)
      );
    } catch (err) {
      console.error(err);
      return new EmptyResponse(404);
    }
  }
}
