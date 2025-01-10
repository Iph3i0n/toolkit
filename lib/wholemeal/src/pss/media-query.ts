import StringIterator from "../compiler-utils/string-iterator";
import Sheet from "./sheet";
import * as Js from "@ipheion/js-model";
import { PssBlock } from "./block";
import { Ast } from "../types/ast";
import { RenderContext } from "../xml/render-context";

export class PssMediaQuery extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@media(?:.|\n)+{(?:.|\n)*}$/gm)?.length;
  }

  readonly #data: string;

  constructor(data: string) {
    super();
    this.#data = data;
  }

  get #query() {
    const iterator = new StringIterator(this.#data);
    const result = iterator.GetUntil("{").replace("@media", "").trim();
    if (result.startsWith('":'))
      return new Js.Reference(result.substring(2, result.length - 1));

    return new Js.String(result);
  }

  get #sheet() {
    const iterator = new StringIterator(this.#data);
    iterator.GetUntil("{");
    const block_data = iterator.GetUntil("IMPOSSIBLE");
    return new Sheet(
      block_data.substring(0, block_data.length - 1),
      this.#query
    );
  }

  get JavaScript() {
    return this.#sheet.InlineJavaScript;
  }

  async Ast(ctx: RenderContext): Promise<Array<Ast.Css.Block>> {
    return this.#sheet.Ast(ctx);
  }
}
