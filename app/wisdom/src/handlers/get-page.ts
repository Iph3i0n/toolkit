import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { i_config_repository } from "bootstrap/integrations/i-config-repository";
import IConfigRepository from "integrations/i-config-repository";
import { Handler } from "server";

export default class extends Handler {
  readonly #config_repository: IConfigRepository;

  constructor(config_repository: IConfigRepository = i_config_repository()) {
    super();
    this.#config_repository = config_repository;
  }

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

    const preview_url = new URL(
      "/" +
        [...breadcrumbs.map((b) => b.slug).reverse(), match.slug]
          .slice(1)
          .join("/"),
      (await this.#config_repository.GetConfig()).preview_url
    ).href;

    return new JsonResponse("Ok", { ...match, breadcrumbs, preview_url });
  }
}
