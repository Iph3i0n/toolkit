import { JSDOM } from "jsdom";
import Path from "node:path";
import Fs from "node:fs";
import RunnerContext from "runner-context";
import Node from "node";
import EnvRepository from "env-repository";
import Task from "task";

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

  async Process(ctx: RunnerContext) {
    const env_repository = new EnvRepository(this.element);
    ctx = await env_repository.Process(ctx);

    for (const ele of this.children_of_type("task")) {
      const task = new Task(ele);
      if (task.Name !== ctx.CurrentTarget) continue;
      ctx = await task.Process(ctx);
    }

    return ctx;
  }
}
