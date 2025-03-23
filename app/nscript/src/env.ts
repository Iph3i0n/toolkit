import CodeRunner from "code-runner";
import RunnerContext from "runner-context";

export default class Env extends CodeRunner {
  get Name() {
    return this.require_attribute("name");
  }

  async Value(ctx: RunnerContext) {
    return this.is_code ? await this.run(ctx) : this.require_text();
  }
}
