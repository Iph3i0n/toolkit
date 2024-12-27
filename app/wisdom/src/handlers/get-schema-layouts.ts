import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler } from "server";

export default class GetLayouts extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/schema/layouts";

  async Process(request: PureRequest) {
    return new JsonResponse("Ok", await this.get_layouts());
  }
}
