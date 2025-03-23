import CodeRunner from "code-runner";
import RunnerContext from "runner-context";

export default class Script extends CodeRunner {
  get Name() {
    return this.require_text();
  }

  async Process(ctx: RunnerContext) {
    ctx = ctx.WithCode(this);
    await this.run(ctx);

    return ctx;
  }
}
