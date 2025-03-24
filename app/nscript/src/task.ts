import { valid_element } from "element-store";
import Node from "node";
import RunnerContext from "runner-context";

@valid_element("task")
export default class Task extends Node {
  get Name() {
    return this.require_attribute("name");
  }

  get FullName() {
    let parts: Array<string | null> = [];
    let parent = this.element.parentElement;
    while (parent?.tagName === "TASK") {
      parts = [...parts, parent.getAttribute("name")];
      parent = parent.parentElement;
    }

    return [...parts.filter((p) => p), this.Name].filter((t) => t).join(":");
  }

  get Cwd() {
    return this.element.getAttribute("cwd");
  }

  async Process(ctx: RunnerContext) {
    if (ctx.CurrentTarget !== this.Name) return ctx;
    ctx = ctx.WithCompletedSegment();
    if (this.Cwd) ctx = ctx.WithCwd(this.Cwd);
    ctx = ctx.WithTask(this);
    return await super.Process(ctx);
  }
}
