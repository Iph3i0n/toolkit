import Dep from "dep";
import EnvRepository from "env-repository";
import Import from "import";
import Node from "node";
import RunnerContext from "runner-context";
import Script from "script";

export default class Task extends Node {
  readonly #prefix: string;

  constructor(ele: Element, prefix: string) {
    super(ele);
    this.#prefix = prefix;
  }

  get Name() {
    return this.require_attribute("name");
  }

  get FullName() {
    return [this.#prefix, this.Name].filter((t) => t).join(":");
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
        task: (ele, ctx): Promise<RunnerContext> =>
          new Task(ele, this.FullName).Process(ctx),
        // A dependency starts a new context
        dep: (ele, ctx) => new Dep(ele).Process(ctx).then(() => ctx),
        import: (ele, ctx) => new Import(ele).Process(ctx),
      },
      ctx
    );
  }
}
