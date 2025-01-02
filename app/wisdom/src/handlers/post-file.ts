import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import { Handler, Result } from "server";
import { v4 as Guid } from "uuid";

const IsBody = IsObject({
  name: IsString,
  data: IsString,
  mime: IsString,
});

export default class extends Handler {
  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/media/:id/files";

  async Process(request: PureRequest) {
    const { id } = request.Parameters({ id: IsString });
    const body = request.Body(IsBody);
    const match = this.State.media[id];
    if (!match) return new EmptyResponse("NotFound");

    const file_id = Guid();

    return new Result(new JsonResponse("Created", { id }), {
      media: {
        [id]: {
          ...match,
          files: [
            ...match.files,
            {
              name: body.name,
              local_name: file_id,
            },
          ],
        },
      },
      files: {
        [file_id]: {
          data: Buffer.from(body.data, "base64"),
          mime: body.mime,
        },
      },
    });
  }
}
