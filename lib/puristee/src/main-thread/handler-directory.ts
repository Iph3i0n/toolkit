import Fs from "node:fs";
import Path from "node:path";
import { v4 as Guid } from "uuid";

export class HandlerDirectory {
  readonly #handlers: Record<string, string> = {};

  constructor(dir: string) {
    for (const item of Fs.readdirSync(dir)) {
      if (!item.endsWith(".js")) continue;
      const loc = Path.resolve(dir, item);
      this.#handlers[Guid()] = loc;
    }
  }

  get Handlers() {
    return this.#handlers;
  }
}
