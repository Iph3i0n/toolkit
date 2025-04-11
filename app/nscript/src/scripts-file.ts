import { JSDOM } from "jsdom";
import Path from "node:path";
import Fs from "node:fs";
import RunnerContext from "runner-context";
import Node from "node";

export default class ScriptsFile extends Node {
  readonly #file_dir: string;

  private constructor(cwd: string, path: string) {
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

    this.#file_dir = Path.dirname(full_path);
  }

  static readonly #entries: Record<string, ScriptsFile> = {};

  static Fetch(cwd: string, path: string) {
    const full_path = Path.resolve(cwd, path);
    this.#entries[full_path] =
      this.#entries[full_path] ?? new ScriptsFile(cwd, path);

    return this.#entries[full_path];
  }

  get FileDir() {
    return this.#file_dir;
  }

  readonly #run: Array<string> = [];

  async Process(ctx: RunnerContext) {
    if (this.#run.includes(ctx.FullTarget)) return ctx;
    this.#run.push(ctx.FullTarget);
    return await super.Process(ctx);
  }
}
