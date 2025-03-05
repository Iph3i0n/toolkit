import Entity from "domain/entity";
import { Handler, IHandler } from "handler";
import Request from "request";
import Response, { EmptyResponse, FileResponse, TextResponse } from "response";

@Handler("/entities/:id/image", "get")
export default class Controller implements IHandler {
  async Handle(request: Request): Promise<Response> {
    const id = request.Param("id");
    if (!id) return new EmptyResponse(404);

    try {
      const result = new Entity(parseInt(id));
      if (!result.Img) {
        return new TextResponse(
          200,
          `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000">
              <path d="M15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path>
            </svg>
          `,
          "image/svg+xml"
        );
      } else {
        return new FileResponse(result.Img.DiskPath, result.Img.MimeType);
      }
    } catch (err) {
      console.error(err);
      return new EmptyResponse(404);
    }
  }
}
