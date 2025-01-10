import { Ast } from "../types/ast";
import { RenderContext } from "../xml/render-context";
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

  async Ast(ctx: RenderContext): Promise<Array<Ast.Css.Block>> {
    throw new Error("JS snippets are not allowed in static PSS");
  }
}
