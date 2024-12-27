import CreateServer from "@ipheion/puristee";
import Path from "node:path";
import Fs from "node:fs/promises";
import { Assert } from "@ipheion/safe-type";
import { IsPublics } from "types/config";
import Component from "@ipheion/wholemeal/dist/xml/component";
import { Page } from "state/page";
import { Block } from "state/block";

export const DataDir = process.env.DATA_DIR ?? "./data";

const Server = CreateServer(Path.resolve(DataDir), {
  pages: Page,
  blocks: Block,
});

export class Handler extends Server.Handler {
  async #package_json() {
    const data = await Fs.readFile("package.json", "utf8");
    return JSON.parse(data);
  }

  async #config() {
    const package_json = await this.#package_json();
    const {
      layouts = "./layouts",
      blocks = "./blocks",
      components = "./components",
      publics = [],
    } = package_json.wisdom ?? {};

    Assert(IsPublics, publics);

    return {
      layouts,
      blocks,
      components,
      publics,
    };
  }

  async get_layouts() {
    const { layouts } = await this.#config();

    return (await Fs.readdir(Path.resolve(layouts))).map((l) =>
      l.replace(".std", "")
    );
  }

  async get_blocks() {
    const { blocks } = await this.#config();

    return (await Fs.readdir(Path.resolve(blocks))).map((l) =>
      l.replace(".std", "")
    );
  }

  async get_components() {
    const { components } = await this.#config();

    return (await Fs.readdir(Path.resolve(components))).map((l) =>
      l.replace(".std", "")
    );
  }

  async get_layout(name: string) {
    const { layouts } = await this.#config();
    const data = await Fs.readFile(
      Path.resolve(layouts, name + ".std"),
      "utf8"
    );
    return new Component(data);
  }

  async get_block(name: string) {
    const { blocks } = await this.#config();
    const data = await Fs.readFile(Path.resolve(blocks, name + ".std"), "utf8");
    return new Component(data);
  }
}

export const Result = Server.Response;

export type Result = typeof Server.Response;
