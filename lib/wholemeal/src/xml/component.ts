import Code from "./code";
import Node from "./node";
import Text from "./text";
import Element from "./element";
import Sheet from "../pss/sheet";
import * as Js from "../writer/mod";
import Metadata from "./metadata/mod";
import { Assert, IsInstanceOf } from "@ipheion/safe-type";
import { JoinComponents, RenderContext, RenderResult } from "./render-context";

const IsImport = /import (?:(?:[^;'"]|\n)+ from )?['"].+['"]/gm;

type ScriptContents = {
  main: string;
  handlers: Record<string, string>;
};

export default class Component {
  readonly #children: Array<Node> = [];
  readonly #script_contents: ScriptContents;

  constructor(code: string) {
    const code_object = new Code(code);
    while (!code_object.Done)
      if (
        code_object.Current === "<" ||
        code_object.Current.startsWith("<script") ||
        code_object.Current.startsWith("<style")
      )
        this.#children.push(new Element(code_object));
      else this.#children.push(new Text(code_object));
    this.#script_contents = this.#children
      .filter((c) => c instanceof Element && c.TagName === "script")
      .reduce(
        (c, n) => {
          Assert(IsInstanceOf(Element), n);
          const data = n.TextContent;
          const handler = n.RawAttribute.on;
          if (!handler || typeof handler !== "string")
            return { ...c, main: data };
          return { ...c, handlers: { ...c.handlers, [handler]: data } };
        },
        { main: "", handlers: {} as Record<string, string> }
      );
  }

  #find_tag(name: string) {
    const target = this.#children.find(
      (c) => c instanceof Element && c.TagName === name
    );
    if (!target || !(target instanceof Element)) return undefined;
    return target;
  }

  get ScriptMain() {
    return this.#script_contents.main.replaceAll(IsImport, "").trim();
  }

  get ScriptImports() {
    return [...(this.#script_contents.main.match(IsImport) ?? [])]
      .map((s) => s)
      .join(";");
  }

  get Handlers() {
    return this.#script_contents.handlers;
  }

  get HasBehaviour() {
    return !!this.#script_contents.main;
  }

  get Css() {
    const target = this.#children.find(
      (c) => c instanceof Element && c.TagName === "style"
    );
    if (!target || !(target instanceof Element)) return new Sheet("");

    return new Sheet(target.TextContent);
  }

  get Html() {
    return [
      new Js.Declare("const", "result", new Js.Array()),
      ...this.#children
        .filter((c) => !(c instanceof Element) || !c.IsMetaTag)
        .map((c) => c.JavaScript),
    ];
  }

  get Metadata() {
    const tag = this.#find_tag("s:meta");
    if (!tag || !tag.RawAttribute.name)
      throw new Error("Components must have a meta tag with a name attribute");

    return new Metadata(tag);
  }

  async ToString(context: RenderContext) {
    if (this.HasBehaviour)
      throw new Error("Static components may not have behaviour");

    return (
      await Promise.all(
        this.#children
          .filter((c) => !(c instanceof Element) || !c.IsMetaTag)
          .map((c) => c.ToString(context))
      )
    ).reduce(
      (c, n) => ({
        html: c.html + n.html,
        css: { ...c.css, ...n.css },
        web_components: { ...c.web_components, ...n.web_components },
      }),
      { html: "", css: {}, web_components: {} } as RenderResult
    );
  }

  GetWebComponents(context: RenderContext): Record<string, Component> {
    return JoinComponents(
      this.#children.map((c) => c.GetWebComponents(context))
    );
  }
}
