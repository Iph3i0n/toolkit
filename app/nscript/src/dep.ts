import Node from "node";
import RunnerContext from "runner-context";

export default class Dep extends Node {
  Process(ctx: RunnerContext): Promise<RunnerContext> {
    return ctx.ScriptsFile.Process(
      ctx.WithDependency(this.require_attribute("task"))
    );
  }
}
