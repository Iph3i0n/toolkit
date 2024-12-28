import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { Handler, Result } from "server";

export default class PostPage extends Handler {
  readonly Method = HttpMethod.Delete;
  readonly Url = "/api/v1/blocks/:id";

  async Process(request: PureRequest) {
    const { id } = request.Parameters({ id: IsString });

    return new Result(new JsonResponse("NoContent", { id }), {
      blocks: {
        [id]: undefined,
      },
    });
  }
}
