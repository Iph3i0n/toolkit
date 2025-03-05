import Category from "domain/category";
import { Handler, IHandler } from "handler";
import { CreateCategoryModel } from "models/category";
import Request from "request";
import { JsonResponse } from "response";

@Handler("/categories", "post")
export default class Controller implements IHandler {
  async Handle(request: Request) {
    const data = request.Body(CreateCategoryModel);
    const result = new Category(
      data.name,
      data.parent ? new Category(data.parent) : undefined
    );
    return new JsonResponse(201, { id: result.Id });
  }
}
