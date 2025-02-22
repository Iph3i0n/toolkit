import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { Handler, Result } from "server";
import { Authenticated } from "utils/authenticate";

export default class extends Handler {
  readonly Method = HttpMethod.Delete;
  readonly Url = "/api/v1/pages/:id";

  @Authenticated
  async Process(request: PureRequest) {
    const { id } = request.Parameters({ id: IsString });

    return new Result(new JsonResponse("NoContent", { id }), {
      pages: {
        [id]: undefined,
      },
    });
  }
}
