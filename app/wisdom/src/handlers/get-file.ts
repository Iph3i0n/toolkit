import {
  EmptyResponse,
  HttpMethod,
  MemoryFileResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler } from "server";
import { IsString } from "@ipheion/safe-type";
import Mime from "mime-types";

function GetMime(path: string) {
  const extension = path.split(".").findLast(() => true);

  return Mime.lookup(extension ?? "");
}

export default class extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/media/:id/images/:file_name";

  async Process(request: PureRequest) {
    const { id, file_name } = request.Parameters({
      id: IsString,
      file_name: IsString,
    });
    const match = this.State.media[id];
    if (!match) return new EmptyResponse("NotFound");

    const file_id = match.files.find((f) => f.name === file_name)?.local_name;
    if (!file_id) return new EmptyResponse("NotFound");
    const file = this.State.files[file_id];

    return new MemoryFileResponse(Buffer.from(file), GetMime(file_name) || "");
  }
}
