import CodeRunner from "code-runner";
import RunnerContext from "runner-context";

export default class Env extends CodeRunner {
  get Name() {
    return this.require_attribute("name");
  }

  async Process(ctx: RunnerContext) {
    if (this.is_code) {
      return ctx.WithEnvVar(this.Name, this.require_text());
    }

    ctx = ctx.WithCode(this);
    return ctx.WithEnvVar(this.Name, await this.run(ctx));
  }
}
