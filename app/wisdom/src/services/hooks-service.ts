import IConfigRepository from "integrations/i-config-repository";
import Path from "path";
import Fs from "fs";

export default class HooksService {
  readonly #config_repository: IConfigRepository;

  constructor(config_repository: IConfigRepository) {
    this.#config_repository = config_repository;
  }

  async Trigger(name: string, ...args: Array<any>) {
    const config = await this.#config_repository.GetConfig();
    const hook_path = Path.resolve(config.hooks_dir, name + ".js");
    if (!Fs.existsSync(hook_path)) return;

    let hook = require(hook_path);
    if ("default" in hook) hook = hook.default;
    return await hook(Path.resolve(config.dist_dir));
  }

  async Exists(name: string) {
    const config = await this.#config_repository.GetConfig();
    const hook_path = Path.resolve(config.hooks_dir, name + ".js");
    return Fs.existsSync(hook_path);
  }
}
