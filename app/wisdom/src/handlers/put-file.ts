import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import { Handler, Result } from "server";

const IsBody = IsObject({
  data: IsString,
  mime: IsString,
});

export default class extends Handler {
  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/media/:id/files/:file_name";

  async Process(request: PureRequest) {
    const { id, file_name } = request.Parameters({
      id: IsString,
      file_name: IsString,
    });
    const body = request.Body(IsBody);
    const match = this.State.media[id];
    if (!match) return new EmptyResponse("NotFound");
    const existing = match.files.find((f) => f.name === file_name);
    if (!existing) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("Created", { id }), {
      files: {
        [existing.local_name]: {
          data: Buffer.from(body.data, "base64"),
          mime: body.mime,
        },
      },
    });
  }
}
