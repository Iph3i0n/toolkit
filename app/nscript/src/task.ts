import Dep from "dep";
import EnvRepository from "env-repository";
import Node from "node";
import RunnerContext from "runner-context";
import Script from "script";

export default class Task extends Node {
  get Name() {
    return this.require_attribute("name");
  }

  get Cwd() {
    return this.element.getAttribute("cwd");
  }

  async Process(ctx: RunnerContext) {
    ctx = ctx.WithCompletedSegment();
    if (this.Cwd) ctx = ctx.WithCwd(this.Cwd);
    ctx = ctx.WithTask(this);
    const env_repository = new EnvRepository(this.element);
    ctx = await env_repository.Process(ctx);
    return await this.map_children(
      {
        script: (ele, ctx) => new Script(ele).Process(ctx),
        task: (ele, ctx): Promise<RunnerContext> => new Task(ele).Process(ctx),
        dep: async (ele, ctx) => {
          await new Dep(ele).Process(ctx);
          return ctx;
        },
      },
      ctx
    );
  }
}
