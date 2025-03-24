import { valid_element } from "element-store";
import Node from "node";
import RunnerContext from "runner-context";

@valid_element("task")
export default class Task extends Node {
  get Name() {
    return this.require_attribute("name");
  }

  get FullName() {
    return [this.Name].filter((t) => t).join(":");
  }

  get Cwd() {
    return this.element.getAttribute("cwd");
  }

  async Process(ctx: RunnerContext) {
    ctx = ctx.WithCompletedSegment();
    if (this.Cwd) ctx = ctx.WithCwd(this.Cwd);
    ctx = ctx.WithTask(this);
    return await super.Process(ctx);
  }
}
