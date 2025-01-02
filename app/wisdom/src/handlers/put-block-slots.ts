import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsArray, IsDictionary, IsObject, IsString } from "@ipheion/safe-type";
import { Handler, Result } from "server";

const IsPostBlock = IsObject({
  slots: IsDictionary(IsArray(IsString)),
});

export default class extends Handler {
  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/blocks/:id/slots";

  async Process(request: PureRequest) {
    const body = request.Body(IsPostBlock);
    const { id } = request.Parameters({ id: IsString });
    const existing = this.State.blocks[id];

    return new Result(new JsonResponse("Ok", { id }), {
      blocks: {
        [id]: {
          ...existing,
          slots: body.slots,
        },
      },
    });
  }
}
