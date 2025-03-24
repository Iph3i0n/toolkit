import CodeRunner from "code-runner";
import { valid_element } from "element-store";
import RunnerContext from "runner-context";

@valid_element("env")
export default class Env extends CodeRunner {
  get Name() {
    return this.require_attribute("name");
  }

  async Process(ctx: RunnerContext) {
    if (!this.is_code) {
      return ctx.WithEnvVar(this.Name, this.require_text());
    }

    ctx = ctx.WithCode(this);
    const result = await this.run(ctx);
    return ctx.WithEnvVar(this.Name, result.trim());
  }
}
