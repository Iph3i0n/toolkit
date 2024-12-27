import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler } from "server";

export default class GetBlocks extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/schema/blocks";

  async Process(request: PureRequest) {
    return new JsonResponse("Ok", await this.get_blocks());
  }
}
