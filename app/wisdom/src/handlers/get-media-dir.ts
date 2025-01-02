import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { Handler } from "server";

export default class extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/media/:id";

  async Process(request: PureRequest) {
    const { id } = request.Parameters({ id: IsString });
    const match = this.State.media[id];
    if (!match) return new EmptyResponse("NotFound");

    const breadcrumbs = [];
    let current = match;
    while (current.parent) {
      const id = current.parent;
      current = this.State.media[id];
      breadcrumbs.push({ id, slug: current.slug });
    }

    return new JsonResponse("Ok", {
      slug: match.slug,
      files: match.files.map((f) => f.name),
      breadcrumbs,
      children: this.State.media
        .Filter((_, item) => item.parent === id)
        .map(([id, value]) => ({ id, ...value })),
    });
  }
}
