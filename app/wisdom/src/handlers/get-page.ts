import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { Handler } from "server";

export default class GetPage extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/pages/:id";

  async Process(request: PureRequest) {
    const { id } = request.Parameters({ id: IsString });
    const match = this.State.pages[id];

    const breadcrumbs = [];
    let current = match;
    while (current.parent) {
      const id = current.parent;
      current = this.State.pages[id];
      breadcrumbs.push({ id, slug: current.slug });
    }

    return new JsonResponse("Ok", { ...match, breadcrumbs });
  }
}
