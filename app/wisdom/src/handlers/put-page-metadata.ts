import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsObject, IsString, Optional } from "@ipheion/safe-type";
import { Handler, Result } from "server";
import { Authenticated } from "utils/authenticate";

const IsPostPage = IsObject({
  slug: IsString,
  layout: IsString,
  parent: Optional(IsString),
});

export default class extends Handler {
  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/pages/:id";

  @Authenticated
  async Process(request: PureRequest) {
    const body = request.Body(IsPostPage);
    const { id } = request.Parameters({ id: IsString });
    const existing = this.State.pages[id];

    return new Result(new JsonResponse("Ok", { id }), {
      pages: {
        [id]: {
          ...existing,
          slug: body.slug,
          layout: body.layout,
          parent: body.parent ?? null,
        },
      },
    });
  }
}
