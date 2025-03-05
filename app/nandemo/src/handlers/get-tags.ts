import Tag from "domain/tag";
import { Handler, IHandler } from "handler";
import { GetTagTreeModel } from "models/tag";
import Request from "request";
import { JsonResponse } from "response";

@Handler("/tags", "get")
export default class Controller implements IHandler {
  #to_model(tag: Tag): GetTagTreeModel {
    return {
      id: tag.Id,
      name: tag.Name,
      children: Tag.Children(tag).map((t) => this.#to_model(t)),
    };
  }

  async Handle(request: Request) {
    const results = Tag.Children();

    return new JsonResponse(
      200,
      results.map((r) => this.#to_model(r))
    );
  }
}
