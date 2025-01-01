import Base from "./base";

export default class AssignWriter extends Base {
  readonly #subject: Base;
  readonly #target: Base;

  constructor(subject: Base, value: Base) {
    super();
    this.#subject = subject;
    this.#target = value;
  }

  toString(): string {
    return `${this.#subject} = ${this.#target}`;
  }
}
