import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import { Handler, Result } from "server";

const IsBody = IsObject({
  slug: IsString,
});

export default class extends Handler {
  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/media/:id";

  async Process(request: PureRequest) {
    const { id } = request.Parameters({ id: IsString });
    const body = request.Body(IsBody);
    const match = this.State.media[id];
    if (!match) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("Ok", { id }), {
      media: {
        [id]: {
          ...match,
          slug: body.slug,
        },
      },
    });
  }
}
