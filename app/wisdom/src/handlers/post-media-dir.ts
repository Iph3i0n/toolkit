import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import { Handler, Result } from "server";
import { Authenticated } from "utils/authenticate";
import { v4 as Guid } from "uuid";

const IsPostMediaDir = IsObject({
  slug: IsString,
  parent: IsString,
});

export default class extends Handler {
  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/media";

  @Authenticated
  async Process(request: PureRequest) {
    const body = request.Body(IsPostMediaDir);
    const id = Guid();

    return new Result(new JsonResponse("Created", { id }), {
      media: {
        [id]: {
          files: [],
          slug: body.slug,
          parent: body.parent,
        },
      },
    });
  }
}
