import { valid_element } from "element-store";
import Node from "node";
import RunnerContext from "runner-context";

@valid_element("dep")
export default class Dep extends Node {
  async Process(ctx: RunnerContext): Promise<RunnerContext> {
    await ctx.ScriptsFile.Process(
      ctx.WithDependency(this.require_attribute("task"))
    );

    return ctx;
  }
}
