import CodeRunner from "code-runner";

export default class Env extends CodeRunner {
  get Name() {
    return this.require_attribute("name");
  }

  get Value() {
    const text = this.require_text();

    const is_code = this.element.getAttribute("is-code");
    if (is_code == null) return text;
  }
}
