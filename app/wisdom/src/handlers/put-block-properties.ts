import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsDictionary, IsObject, IsString } from "@ipheion/safe-type";
import { Handler, Result } from "server";
import { Authenticated } from "utils/authenticate";

const IsPostBlock = IsObject({
  properties: IsDictionary(IsString),
});

export default class extends Handler {
  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/blocks/:id/properties";

  @Authenticated
  async Process(request: PureRequest) {
    const body = request.Body(IsPostBlock);
    const { id } = request.Parameters({ id: IsString });
    const existing = this.State.blocks[id];

    return new Result(new JsonResponse("Ok", { id }), {
      blocks: {
        [id]: {
          ...existing,
          properties: body.properties,
        },
      },
    });
  }
}
