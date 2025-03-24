import CodeRunner from "code-runner";
import { valid_element } from "element-store";
import RunnerContext from "runner-context";

@valid_element("script")
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
