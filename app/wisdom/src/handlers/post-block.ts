import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsObject, IsString, Optional } from "@ipheion/safe-type";
import { Handler, Result } from "server";
import { v4 as Guid } from "uuid";

const IsPostBlock = IsObject({
  slug: Optional(IsString),
  type: IsString,
});

export default class extends Handler {
  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/blocks";

  async Process(request: PureRequest) {
    const body = request.Body(IsPostBlock);
    const id = Guid();

    return new Result(new JsonResponse("Created", { id }), {
      blocks: {
        [id]: {
          slug: body.slug || null,
          type: body.type,
          properties: {},
          slots: {},
        },
      },
    });
  }
}
