import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { Handler } from "server";

export default class GetBlock extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/blocks/:id";

  async Process(request: PureRequest) {
    const { id } = request.Parameters({ id: IsString });
    const match = this.State.blocks[id];

    return new JsonResponse("Ok", match);
  }
}
