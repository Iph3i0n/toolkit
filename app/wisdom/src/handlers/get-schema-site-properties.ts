import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { i_config_repository } from "bootstrap/integrations/i-config-repository";
import IConfigRepository from "integrations/i-config-repository";
import { Handler } from "server";
import { Authenticated } from "utils/authenticate";

export default class extends Handler {
  readonly #config_repository: IConfigRepository;

  constructor(config_repository: IConfigRepository = i_config_repository()) {
    super();
    this.#config_repository = config_repository;
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/schema/site-properties";

  @Authenticated
  async Process(request: PureRequest) {
    const config = await this.#config_repository.GetConfig();
    return new JsonResponse("Ok", config.properties);
  }
}
