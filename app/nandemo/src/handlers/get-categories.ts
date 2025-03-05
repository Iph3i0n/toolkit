import Category from "domain/category";
import { Handler, IHandler } from "handler";
import { GetCategoryTreeModel } from "models/category";
import Request from "request";
import { JsonResponse } from "response";

@Handler("/categories", "get")
export default class Controller implements IHandler {
  #to_model(tag: Category): GetCategoryTreeModel {
    return {
      id: tag.Id,
      name: tag.Name,
      children: Category.Children(tag).map((t) => this.#to_model(t)),
    };
  }

  async Handle(request: Request) {
    const results = Category.Children();

    return new JsonResponse(
      200,
      results.map((r) => this.#to_model(r))
    );
  }
}
