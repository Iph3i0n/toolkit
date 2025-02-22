import Code from "../compiler-utils/code-transform";
import * as Js from "@ipheion/js-model";
import { PssAtBlock } from "./at-block";
import { PssAtStatement } from "./at-statement";
import { PssForBlock } from "./for-block";
import { PssIfBlock } from "./if-block";
import { PssInsertStatement } from "./insert-statement";
import { PssJsStatement } from "./js-statement";
import { PssMediaQuery } from "./media-query";
import { PssRule } from "./rule";
import { Ast } from "../types/ast";
import { RenderContext } from "../xml/render-context";

export default class Sheet {
  readonly #data: Code;
  readonly #media: Js.Any | undefined;

  constructor(data: string, media?: Js.Any) {
    this.#data = new Code(data);
    this.#media = media;
  }

  *#parts() {
    for (const part of this.#data)
      if (PssRule.IsValid(part)) yield new PssRule(part, this.#media);
      else if (PssMediaQuery.IsValid(part)) yield new PssMediaQuery(part);
      else if (PssIfBlock.IsValid(part))
        yield new PssIfBlock(part, this.#media);
      else if (PssForBlock.IsValid(part))
        yield new PssForBlock(part, this.#media);
      else if (PssAtBlock.IsValid(part))
        yield new PssAtBlock(part, this.#media);
      else if (PssJsStatement.IsValid(part)) yield new PssJsStatement(part);
      else if (PssInsertStatement.IsValid(part))
        yield new PssInsertStatement(part);
      else if (PssAtStatement.IsValid(part)) yield new PssAtStatement(part);
      else throw new Error("Invalid part of \n" + part);
  }

  get JavaScript() {
    return new Js.Function(
      [],
      "arrow",
      undefined,
      new Js.Block(
        new Js.Declare("const", "result", new Js.Array()),
        ...this.InlineJavaScript,
        new Js.Return(new Js.Reference("result"))
      )
    );
  }

  get InlineJavaScript(): Array<Js.Any> {
    return [...this.#parts()].flatMap((p) => p.JavaScript);
  }

  async Ast(ctx: RenderContext): Promise<Ast.Css.Sheet> {
    return (
      await Promise.all([...this.#parts()].map((p) => p.Ast(ctx)))
    ).flat();
  }
}
