import * as Js from "../writer/mod";
import { RenderContext } from "./render-context";

const NodeSymbol = Symbol();

export default abstract class Node {
  get Symbol() {
    return NodeSymbol;
  }

  abstract readonly JavaScript: Js.Any;

  abstract ToString(context: RenderContext): Promise<string>;
}
