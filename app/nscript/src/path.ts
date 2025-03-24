import { valid_element } from "element-store";
import Node from "node";
import RunnerContext from "runner-context";
import NodePath from "node:path";

@valid_element("path")
export default class Path extends Node {
  async Process(ctx: RunnerContext): Promise<RunnerContext> {
    return ctx.WithEnvVar(
      "PATH",
      [
        ctx.Env.PATH ?? "",
        NodePath.resolve(ctx.Cwd, this.require_attribute("location")),
      ].join(":")
    );
  }
}
