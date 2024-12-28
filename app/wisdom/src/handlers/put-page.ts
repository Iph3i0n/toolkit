import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import {
  IsArray,
  IsDictionary,
  IsObject,
  IsString,
  Optional,
} from "@ipheion/safe-type";
import { Handler, Result } from "server";

const IsPostPage = IsObject({
  slug: IsString,
  layout: IsString,
  parent: Optional(IsString),
  properties: IsDictionary(IsString),
  slots: IsDictionary(IsArray(IsString)),
});

export default class PostPage extends Handler {
  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/pages/:id";

  async Process(request: PureRequest) {
    const body = request.Body(IsPostPage);
    const { id } = request.Parameters({ id: IsString });

    return new Result(new JsonResponse("Ok", { id }), {
      pages: {
        [id]: {
          slug: body.slug,
          layout: body.layout,
          parent: body.parent ?? null,
          properties: body.properties,
          slots: body.slots,
        },
      },
    });
  }
}
