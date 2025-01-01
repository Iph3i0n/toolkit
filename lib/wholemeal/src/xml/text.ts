import * as Js from "@ipheion/js-model";
import Code from "./code";
import Component from "./component";
import Node from "./node";
import { RenderContext } from "./render-context";

export default class Text extends Node {
  readonly #data: string;

  constructor(code: Code | string) {
    super();
    if (typeof code === "string") this.#data = code;
    else {
      let result = "";
      while (!code.Done && !code.IsKeyword) {
        result += code.Current;
        code.Continue();
      }

      this.#data = result;
    }
  }

  get JavaScript() {
    return new Js.Call(
      new Js.Access("push", new Js.Reference("result")),
      new Js.String(this.#data.trim())
    );
  }

  get TextContent() {
    return this.#data;
  }

  async ToString(context: RenderContext) {
    return {
      html: this.TextContent,
      css: {},
      web_components: {},
    };
  }

  GetWebComponents(context: RenderContext): Record<string, Component> {
    return {};
  }
}
