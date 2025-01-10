import StringIterator from "../compiler-utils/string-iterator";
import Sheet from "./sheet";
import * as Js from "@ipheion/js-model";
import { PssBlock } from "./block";
import { Ast } from "../types/ast";
import { RenderContext } from "../xml/render-context";
import { EvaluateFor } from "../xml/evaluate";

export class PssForBlock extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^@for(?:.|\n)+{(?:.|\n)*}$/gm)?.length;
  }

  readonly #data: string;
  readonly #media: Js.Any | undefined;

  constructor(data: string, media?: Js.Any) {
    super();
    this.#data = data;
    this.#media = media;
  }

  get #statement() {
    const iterator = new StringIterator(this.#data);
    const result = iterator.GetUntil("{").replace("@for", "").trim();

    return new Js.Reference(result);
  }

  get #sheet() {
    const iterator = new StringIterator(this.#data);
    iterator.GetUntil("{");
    const block_data = iterator.GetUntil("IMPOSSIBLE");
    return new Sheet(
      block_data.substring(0, block_data.length - 1),
      this.#media
    );
  }

  get JavaScript(): Array<Js.Any> {
    return [
      new Js.GenericFor(
        this.#statement,
        new Js.Block(...this.#sheet.InlineJavaScript)
      ),
    ];
  }

  async Ast(ctx: RenderContext): Promise<Array<Ast.Css.Block>> {
    const statement = this.#statement.toString();
    const { key, data } = await EvaluateFor(statement, ctx);

    const sheet = this.#sheet;
    const result = [];
    for (const item of data)
      result.push(
        ...(await sheet.Ast({
          ...ctx,
          parameters: {
            ...ctx.parameters,
            [key]: item,
          },
        }))
      );

    return result;
  }
}
