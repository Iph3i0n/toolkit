import Tag from "domain/tag";
import { Handler, IHandler } from "handler";
import { CreateTagModel } from "models/tag";
import Request from "request";
import { JsonResponse } from "response";

@Handler("/tags", "post")
export default class Controller implements IHandler {
  async Handle(request: Request) {
    const data = request.Body(CreateTagModel);
    const result = new Tag(
      data.name,
      data.parent ? new Tag(data.parent) : undefined
    );
    return new JsonResponse(201, { id: result.Id });
  }
}
