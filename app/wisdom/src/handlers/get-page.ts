import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { i_config_repository } from "bootstrap/integrations/i-config-repository";
import { n_page_service } from "bootstrap/services/page-service";
import IConfigRepository from "integrations/i-config-repository";
import { Handler } from "server";
import PageService from "services/page-service";
import { Authenticated } from "utils/authenticate";

export default class extends Handler {
  readonly #config_repository: IConfigRepository;
  readonly #page_service: PageService;

  constructor(
    config_repository: IConfigRepository = i_config_repository(),
    page_service: PageService = n_page_service()
  ) {
    super();
    this.#config_repository = config_repository;
    this.#page_service = page_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/pages/:id";

  @Authenticated
  async Process(request: PureRequest) {
    const { id } = request.Parameters({ id: IsString });
    const match = this.#page_service.GetPage(id);

    const preview_url = new URL(
      "/" +
        [...match.breadcrumbs.map((b) => b.slug).reverse(), match.slug]
          .slice(1)
          .join("/"),
      (await this.#config_repository.GetConfig()).preview_url
    ).href;

    return new JsonResponse("Ok", { ...match, preview_url });
  }
}
