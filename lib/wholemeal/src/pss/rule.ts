import * as Js from "@ipheion/js-model";
import { PssProperty } from "./property";
import StringIterator from "../compiler-utils/string-iterator";
import { PssBlock } from "./block";
import { Ast } from "../types/ast";
import { RenderContext } from "../xml/render-context";
import { EvaluateJsModel } from "../xml/evaluate";

export class PssRule extends PssBlock {
  static IsValid(data: string) {
    return !!data.match(/^[^@](?:.|\n)+{(?:.|\n)*}$/gm)?.length;
  }

  readonly #data: string;
  readonly #media: Js.Any | undefined;

  constructor(data: string, media: Js.Any | undefined) {
    super();
    this.#data = data;
    this.#media = media;
  }

  get #selector() {
    const iterator = new StringIterator(this.#data);
    const result = iterator.GetUntil("{").trim();
    if (result.startsWith('":')) {
      return new Js.Reference(result.substring(2, result.length - 1));
    }

    return new Js.String(result);
  }

  get #properties() {
    const iterator = new StringIterator(this.#data);
    iterator.GetUntil("{");
    const block_data = new StringIterator(iterator.GetUntil("}"));
    return block_data
      .Split(";")
      .filter((d) => d.trim())
      .map((d) => new PssProperty(d, this.#media));
  }

  get JavaScript() {
    return [
      new Js.Call(
        new Js.Access("push", new Js.Reference("result")),
        new Js.Object({
          selector: this.#selector,
          properties: new Js.Array(
            ...this.#properties.map((p) => p.JavaScript)
          ),
        })
      ),
    ];
  }

  async Ast(ctx: RenderContext): Promise<Array<Ast.Css.Rule>> {
    return [
      {
        selector: await EvaluateJsModel(this.#selector, ctx),
        properties: (
          await Promise.all(this.#properties.map((p) => p.Ast(ctx)))
        ).flat(),
      },
    ];
  }
}
