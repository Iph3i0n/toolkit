import { Handler, Result, State } from "sso/server";
import {
  EmptyResponse,
  HttpMethod,
  MemoryFileResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";

export default class GetProfilePicture extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/profile/pictures/:userid";

  async Process(request: PureRequest) {
    const { userid } = request.Parameters({ userid: IsString }) ?? {};
    if (!userid) return new Result(new EmptyResponse("NotFound"));

    const picture = this.State.pictures[userid];
    if (!picture) return new Result(new EmptyResponse("NotFound"));

    return new Result(
      new MemoryFileResponse(Buffer.from(picture.data), picture.mime)
    );
  }
}
