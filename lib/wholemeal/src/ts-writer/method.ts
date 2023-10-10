import Base from "./base";

export default class AssignWriter extends Base {
  readonly #name: string;
  readonly #returns: Base;
  readonly #access?: "get" | "set";
  readonly #args: Array<[string, Base]>;

  constructor(
    name: string,
    returns: Base,
    access: "get" | "set" | undefined,
    ...args: Array<[string, Base]>
  ) {
    super();
    this.#name = name;
    this.#returns = returns;
    this.#access = access;
    this.#args = args;
  }

  toString(): string {
    return `${this.#access ?? ""} ${this.#name}(${this.#args.map(
      ([name, def]) => `${name}: ${def}`
    )}): ${this.#returns}`;
  }
}
