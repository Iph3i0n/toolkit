import Path from "node:path";
import SyncFs from "node:fs";
import Fs from "node:fs/promises";
import { Component } from "@ipheion/wholemeal/dist/compiler";
import ISchemaRepository from "./i-schema-repository";
import IConfigRepository from "./i-config-repository";

export default class SchemaRepository implements ISchemaRepository {
  readonly #config_repository: IConfigRepository;

  constructor(config_repository: IConfigRepository) {
    this.#config_repository = config_repository;
  }

  async get_layouts() {
    const { layouts } = await this.#config_repository.GetConfig();

    return (await Fs.readdir(Path.resolve(layouts))).map((l) =>
      l.replace(".std", "")
    );
  }

  async is_block(name: string): Promise<boolean> {
    const { blocks } = await this.#config_repository.GetConfig();
    return SyncFs.existsSync(Path.resolve(blocks, name + ".std"));
  }

  async get_blocks() {
    const { blocks } = await this.#config_repository.GetConfig();

    return (await Fs.readdir(Path.resolve(blocks))).map((l) =>
      l.replace(".std", "")
    );
  }

  async get_components() {
    const { components } = await this.#config_repository.GetConfig();
    try {
      return (await Fs.readdir(Path.resolve(components))).map((l) =>
        l.replace(".std", "")
      );
    } catch {
      return [];
    }
  }

  async get_layout(name: string) {
    const { layouts } = await this.#config_repository.GetConfig();
    const data = await Fs.readFile(
      Path.resolve(layouts, name + ".std"),
      "utf8"
    );
    return new Component(data);
  }

  async get_block(name: string) {
    const { blocks } = await this.#config_repository.GetConfig();
    const data = await Fs.readFile(Path.resolve(blocks, name + ".std"), "utf8");
    return new Component(data);
  }

  async get_component(name: string) {
    const { components } = await this.#config_repository.GetConfig();
    const data = await Fs.readFile(
      Path.resolve(components, name + ".std"),
      "utf8"
    );
    return new Component(data);
  }
}
