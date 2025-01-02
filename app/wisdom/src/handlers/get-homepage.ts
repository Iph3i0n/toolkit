import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { n_page_service } from "bootstrap/services/page-service";
import { Handler } from "server";
import PageService from "services/page-service";

export default class extends Handler {
  readonly #page_service: PageService;

  constructor(page_service: PageService = n_page_service()) {
    super();
    this.#page_service = page_service;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/layout/homepage";

  async Process(request: PureRequest) {
    const page = this.#page_service.HomePage;
    if (!page) return new EmptyResponse("NotFound");
    return new JsonResponse("Ok", { id: page.id });
  }
}
