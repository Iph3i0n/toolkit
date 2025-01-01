import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsObject, IsString, Optional } from "@ipheion/safe-type";
import { Handler, Result } from "server";

const IsPostBlock = IsObject({
  slug: Optional(IsString),
  type: IsString,
});

export default class PostPage extends Handler {
  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/blocks/:id";

  async Process(request: PureRequest) {
    const body = request.Body(IsPostBlock);
    const { id } = request.Parameters({ id: IsString });
    const existing = this.State.blocks[id];

    return new Result(new JsonResponse("Ok", { id }), {
      blocks: {
        [id]: {
          ...existing,
          slug: body.slug ?? null,
          type: body.type,
        },
      },
    });
  }
}
