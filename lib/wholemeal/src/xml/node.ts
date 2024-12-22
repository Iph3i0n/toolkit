import * as Js from "../writer/mod";
import type Component from "./component";
import type { RenderContext, RenderResult } from "./render-context";

const NodeSymbol = Symbol();

export default abstract class Node {
  get Symbol() {
    return NodeSymbol;
  }

  abstract readonly JavaScript: Js.Any;

  abstract ToString(context: RenderContext): Promise<RenderResult>;
  abstract GetWebComponents(context: RenderContext): Record<string, Component>;
}
