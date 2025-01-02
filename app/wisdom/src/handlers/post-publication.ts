import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { i_config_repository } from "bootstrap/integrations/i-config-repository";
import { n_builder_service } from "bootstrap/services/builder-service";
import IConfigRepository from "integrations/i-config-repository";
import { Handler } from "server";
import BuilderService from "services/builder-service";
import Fs from "fs";
import Path from "path";

export default class extends Handler {
  readonly #config_repository: IConfigRepository;
  readonly #builder_service: BuilderService;

  constructor(
    config_repository: IConfigRepository = i_config_repository(),
    builder_service: BuilderService = n_builder_service()
  ) {
    super();
    this.#config_repository = config_repository;
    this.#builder_service = builder_service;
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/publications";

  async Process(request: PureRequest) {
    await this.#builder_service.BuildApp();
    const config = await this.#config_repository.GetConfig();
    const publish_hook_path = Path.resolve(config.hooks_dir, "publish.js");
    if (!Fs.existsSync(publish_hook_path))
      return new JsonResponse("NotFound", { error: "No publisher hook" });

    let hook = require(publish_hook_path);
    if ("default" in hook) hook = hook.default;

    await hook(Path.resolve(config.dist_dir));
    return new JsonResponse("Created", { success: true });
  }
}
