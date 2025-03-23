import { JSDOM } from "jsdom";
import Path from "node:path";
import Fs from "node:fs";

export default class ScriptsFile {
  readonly #document: JSDOM;

  constructor(cwd: string, path: string) {
    const full_path = Path.resolve(cwd, path);
    const text = Fs.readFileSync(full_path, "utf8");
    this.#document = new JSDOM(text);
  }

  get #app() {
    const result = this.#document.window.document.querySelector("app");
    if (!result) throw new Error("No app defined");

    return result;
  }
}
