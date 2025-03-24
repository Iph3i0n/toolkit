import { JSDOM } from "jsdom";
import Path from "node:path";
import Fs from "node:fs";
import RunnerContext from "runner-context";
import Node from "node";

export default class ScriptsFile extends Node {
  constructor(cwd: string, path: string) {
    const full_path = Path.resolve(cwd, path);
    const text = Fs.readFileSync(full_path, "utf8");
    const document = new JSDOM(
      text.replaceAll(
        /<(.*?) .*?\/>/gm,
        (match, tagName) => `${match.slice(0, -2)}></${tagName}>`
      )
    );

    const result = document.window.document.querySelector("app");
    if (!result) throw new Error("No app defined");

    super(result);
  }

  readonly #run: Array<string> = [];

  async Process(ctx: RunnerContext) {
    if (this.#run.includes(ctx.FullTarget)) return ctx;
    this.#run.push(ctx.FullTarget);
    return await super.Process(ctx);
  }
}
