import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { n_page_service } from "bootstrap/services/page-service";
import { Handler } from "server";
import PageService from "services/page-service";
import { Authenticated } from "utils/authenticate";

export default class extends Handler {
  readonly #page_service: PageService;

  constructor(page_service: PageService = n_page_service()) {
    super();
    this.#page_service = page_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/blocks/:id";

  @Authenticated
  async Process(request: PureRequest) {
    const { id } = request.Parameters({ id: IsString });
    const match = this.#page_service.GetBlock(id);

    return new JsonResponse("Ok", match);
  }
}
