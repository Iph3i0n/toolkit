import { Assert } from "@ipheion/safe-type";
import IConfigRepository from "./i-config-repository";
import { Config, Publics } from "types/config";
import Fs from "node:fs/promises";

export default class ConfigRepository implements IConfigRepository {
  async #package_json() {
    const data = await Fs.readFile("package.json", "utf8");
    return JSON.parse(data);
  }

  async GetConfig() {
    const package_json = await this.#package_json();
    const {
      layouts = "./layouts",
      blocks = "./blocks",
      components = "./components",
      publics = [],
      dist_dir = "./dist",
      preview_url = "http://localhost:3001",
      hooks_dir = "./hooks",
    } = package_json.wisdom ?? {};

    Assert(Publics, publics);

    const result = {
      layouts,
      blocks,
      components,
      publics,
      dist_dir: process.env.DIST_DIR ?? dist_dir,
      preview_url,
      hooks_dir,
    };

    Assert(Config, result);
    return result;
  }
}
