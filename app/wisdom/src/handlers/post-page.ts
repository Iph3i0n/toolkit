import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsObject, IsString, Optional } from "@ipheion/safe-type";
import { Handler, Result } from "server";
import { v4 as Guid } from "uuid";

const IsPostPage = IsObject({
  slug: IsString,
  layout: IsString,
  parent: Optional(IsString),
});

export default class extends Handler {
  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/pages";

  async Process(request: PureRequest) {
    const body = request.Body(IsPostPage);
    const id = Guid();

    return new Result(new JsonResponse("Created", { id }), {
      pages: {
        [id]: {
          slug: body.slug,
          layout: body.layout,
          parent: body.parent ?? null,
          properties: {},
          slots: {},
        },
      },
    });
  }
}
