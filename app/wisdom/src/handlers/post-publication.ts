import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { i_config_repository } from "bootstrap/integrations/i-config-repository";
import { n_builder_service } from "bootstrap/services/builder-service";
import IConfigRepository from "integrations/i-config-repository";
import { Handler } from "server";
import BuilderService from "services/builder-service";
import Fs from "fs";
import Path from "path";
import { Authenticated } from "utils/authenticate";
import HooksService from "services/hooks-service";
import { n_hooks_service } from "bootstrap/services/hooks-service";

export default class extends Handler {
  readonly #config_repository: IConfigRepository;
  readonly #hooks_service: HooksService;
  readonly #builder_service: BuilderService;

  constructor(
    config_repository: IConfigRepository = i_config_repository(),
    hooks_service: HooksService = n_hooks_service(),
    builder_service: BuilderService = n_builder_service()
  ) {
    super();
    this.#config_repository = config_repository;
    this.#hooks_service = hooks_service;
    this.#builder_service = builder_service;
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/publications";

  @Authenticated
  async Process(request: PureRequest) {
    if (!(await this.#hooks_service.Exists("publish")))
      return new JsonResponse("NotFound", { error: "No publisher hook" });

    await this.#builder_service.BuildApp();
    const config = await this.#config_repository.GetConfig();

    await this.#hooks_service.Trigger("publish", config.dist_dir);
    return new JsonResponse("Created", { success: true });
  }
}
