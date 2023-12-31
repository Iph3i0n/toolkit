import Base from "./base";

export default class StringWriter extends Base {
  readonly #value: string;

  constructor(value: string) {
    super();
    this.#value = value;
  }

  toString(): string {
    return `\`${this.#value.replaceAll("`", "\\`")}\``;
  }
}
