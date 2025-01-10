import {
  EmptyResponse,
  HttpMethod,
  MemoryFileResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler } from "server";
import { IsString } from "@ipheion/safe-type";

export default class extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/files/:id";

  async Process(request: PureRequest) {
    const { id } = request.Parameters({
      id: IsString,
    });
    const match = this.State.files[id];
    if (!match) return new EmptyResponse("NotFound");

    return new MemoryFileResponse(Buffer.from(match.data), match.mime);
  }
}
