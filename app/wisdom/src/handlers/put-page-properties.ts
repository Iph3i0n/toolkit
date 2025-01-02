import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsDictionary, IsObject, IsString, Optional } from "@ipheion/safe-type";
import { Handler, Result } from "server";

const IsPostPage = IsObject({
  properties: Optional(IsDictionary(IsString)),
});

export default class extends Handler {
  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/pages/:id/properties";

  async Process(request: PureRequest) {
    const body = request.Body(IsPostPage);
    const { id } = request.Parameters({ id: IsString });
    const existing = this.State.pages[id];

    return new Result(new JsonResponse("Ok", { id }), {
      pages: {
        [id]: {
          ...existing,
          properties: body.properties ?? {},
        },
      },
    });
  }
}
