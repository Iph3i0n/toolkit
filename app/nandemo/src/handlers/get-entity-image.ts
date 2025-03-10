import Entity from "domain/entity";
import { Handler, IHandler } from "handler";
import Request from "request";
import Response, {
  EmptyResponse,
  FileResponse,
  RedirectResponse,
} from "response";

@Handler("/entities/:id/image", "get")
export default class Controller implements IHandler {
  async Handle(request: Request): Promise<Response> {
    const id = request.Param("id");
    if (!id) return new EmptyResponse(404);

    try {
      const result = new Entity(parseInt(id));
      if (!result.Img) {
        return new RedirectResponse(303, "/_/no-image.svg");
      } else {
        return new FileResponse(result.Img.DiskPath, result.Img.MimeType);
      }
    } catch (err) {
      console.error(err);
      return new EmptyResponse(404);
    }
  }
}
