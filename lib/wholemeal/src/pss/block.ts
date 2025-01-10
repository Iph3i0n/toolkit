import * as Js from "@ipheion/js-model";
import { Ast } from "../types/ast";
import { RenderContext } from "../xml/render-context";

export abstract class PssBlock {
  abstract readonly JavaScript: Array<Js.Any>;

  abstract Ast(ctx: RenderContext): Promise<Array<Ast.Css.Block>>;
}
