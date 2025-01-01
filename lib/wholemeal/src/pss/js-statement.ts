import { PssBlock } from "./block";
import * as Js from "@ipheion/js-model";

export class PssJsStatement extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@js(?:.|\n)+$/gm)?.length;
  }

  readonly #data: string;

  constructor(data: string) {
    super();
    this.#data = data;
  }

  get #statement() {
    return this.#data.replace("@js", "").trim();
  }

  get JavaScript(): Array<Js.Any> {
    return [new Js.Reference(this.#statement)];
  }
}
