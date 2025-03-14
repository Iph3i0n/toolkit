import * as Js from "@ipheion/js-model";
import Code from "./code";
import type Component from "./component";
import Evaluate from "./evaluate";
import Node from "./node";
import {
  Join,
  JoinComponents,
  type RenderContext,
  type RenderResult,
} from "./render-context";
import Text from "./text";
import { Render } from "@ipheion/html";
import Sheet from "../pss/sheet";
import RenderSheet from "../runner/css";
import { HtmlEncode } from "./text-render";

const AllText = ["script", "style"];

export default class Element extends Node {
  readonly #tag: string;
  readonly #attributes: Record<string, string | boolean> = {};
  readonly #children: Array<Node> = [];
  readonly #text_content: string = "";

  #error(message: string, context: unknown) {
    return new Error(`${message}\n${JSON.stringify(context, undefined, 2)}`);
  }

  constructor(code: Code) {
    super();
    if (code.Current.startsWith("<script")) {
      const text = code.Current;
      code.Continue("skip-whitespace");
      this.#tag = "script";
      const on_text_checker = /<script\s+on="([a-zA-Z0-9]+)"\s*>/gm;
      const [, on_text] = on_text_checker.exec(text) ?? [];
      this.#attributes.on = on_text;

      const content_checker =
        /<script(?:\s+on="[a-zA-Z0-9]+")?\s*>((?:.|\n)*?)<\/script>/gm;
      const [, content] = content_checker.exec(text) ?? [];
      if (!content) throw new Error("Could parse script");

      this.#children = [];
      this.#text_content = content;
    } else {
      if (code.Current !== "<")
        throw this.#error("Elements must start with a <", {});
      code.Continue("skip-whitespace");

      this.#tag = code.Current;
      code.Continue("skip-whitespace");

      while (!code.Done && !code.IsKeyword) {
        const name = code.Current;
        code.Continue("skip-whitespace");
        if ((code.Current as string) !== "=") {
          this.#attributes[name] = true;
          continue;
        }

        code.Continue("skip-whitespace");
        if (!code.Current.startsWith('"'))
          throw this.#error("Attributes values must start with strings", {
            tag: this.#tag,
            name,
            symbol: code.Current,
          });

        this.#attributes[name] = code.Current.substring(
          1,
          code.Current.length - 1
        );

        code.Continue("skip-whitespace");
      }

      if ((code.Current as string) === ">") {
        code.Continue("skip-whitespace");
        while (!code.Done && (code.Current as string) !== "</")
          if (AllText.includes(this.#tag)) {
            this.#text_content += code.Current;
            code.Continue();
          } else if (code.Current === "<")
            this.#children.push(new Element(code));
          else this.#children.push(new Text(code));

        code.Continue("skip-whitespace");
        if (code.Current !== this.#tag)
          throw this.#error("Element closing tag mismatch", {
            tag: this.#tag,
            attributes: this.#attributes,
            symbol: code.Current,
          });

        code.Continue("skip-whitespace");
        if ((code.Current as string) !== ">")
          throw this.#error("No closing tag", {
            tag: this.#tag,
            attributes: this.#attributes,
            symbol: code.Current,
          });
        code.Continue("skip-whitespace");
      } else {
        code.Continue("skip-whitespace");
      }
    }
  }

  get TagName() {
    return this.#tag;
  }

  get TextContent() {
    if (!AllText.includes(this.#tag))
      throw new Error("Only text elements contain text content");

    return this.#text_content;
  }

  get Attributes() {
    const array_data = [];
    for (const key in this.#attributes) {
      const value = this.#attributes[key];
      if (!key.startsWith("on:") && !key.startsWith("s:"))
        array_data.push({ name: key, value });
    }

    return new Js.Object(
      array_data.reduce(
        (c, { name, value }) => ({
          ...c,
          [name]:
            typeof value === "boolean"
              ? new Js.Boolean(value)
              : value.startsWith(":")
              ? new Js.Reference(value.replace(":", ""))
              : new Js.String(value),
        }),
        {} as Record<string, Js.Any>
      )
    );
  }

  get RawAttribute() {
    return this.#attributes;
  }

  get TopLevelText() {
    let result = this.#children
      .filter(((c) => c instanceof Text) as (c: Node) => c is Text)
      .map((c: Text) => c.TextContent)
      .join(" ")
      .replaceAll(/\s/gm, " ")
      .trim();

    while (result.includes("  ")) result = result.replaceAll("  ", " ");

    return result;
  }

  IncludesTag(tag: string) {
    return !!this.#children.find((c) => c instanceof Element && c.#tag === tag);
  }

  FindChild(tag: string) {
    return this.#children.find(
      (c) => c instanceof Element && c.#tag === tag
    ) as Element | undefined;
  }

  FindAllChildren(tag: string) {
    return this.#children.filter(
      (c) => c instanceof Element && c.#tag === tag
    ) as Element[];
  }

  get Handlers() {
    const array_data = [];
    for (const key in this.#attributes) {
      const value = this.#attributes[key];
      if (key.startsWith("on:") && !key.startsWith("s:"))
        array_data.push({ name: key, value });
    }

    return new Js.Object(
      array_data.reduce(
        (c, { name, value }) => ({
          ...c,
          [name.replace("on:", "")]: new Js.Call(
            new Js.Reference("handle"),
            new Js.Reference(value.toString())
          ),
        }),
        {} as Record<string, Js.Any>
      )
    );
  }

  get Children() {
    return this.#children.map((c) => c.JavaScript);
  }

  get IsMetaTag() {
    return (
      this.TagName === "script" ||
      this.TagName === "style" ||
      this.TagName === "s:meta"
    );
  }

  get JavaScript() {
    switch (this.#tag) {
      case "s:if":
        return new Js.IfElse(
          new Js.Reference(
            this.#attributes.check.toString()?.replace(":", "") ?? ""
          ),
          new Js.Block(...this.Children),
          new Js.Block(
            ...this.Children.map(
              () =>
                new Js.Call(
                  new Js.Access("push", new Js.Reference("result")),
                  new Js.Reference("null")
                )
            )
          )
        );
      case "s:for":
        return new Js.For(
          this.#attributes.key?.toString() ?? "ctx",
          "of",
          new Js.Reference(
            this.#attributes.subject?.toString().replace(":", "") ?? ""
          ),
          new Js.Block(...this.Children)
        );
      case "s:use":
        return new Js.Block(
          new Js.Declare(
            "const",
            this.#attributes.as?.toString() ?? "",
            new Js.Reference(
              this.#attributes.get?.toString().replace(":", "") ?? ""
            )
          ),
          ...this.Children
        );
      case "s:text":
        if (this.#attributes.html)
          console.warn(
            "HTML text is not supported on web components. It will be escaped."
          );
        return new Js.Call(
          new Js.Access("push", new Js.Reference("result")),
          new Js.Reference(
            this.#attributes.use?.toString().replace(":", "") ?? ""
          )
        );
      default:
        return new Js.Call(
          new Js.Access("push", new Js.Reference("result")),
          new Js.Object({
            tag: new Js.String(this.TagName),
            attr: this.Attributes,
            handlers: this.Handlers,
            children: new Js.Call(
              new Js.Function(
                [],
                "arrow",
                undefined,
                new Js.Block(
                  new Js.Declare("const", "result", new Js.Array()),
                  ...this.Children,
                  new Js.Return(new Js.Reference("result"))
                )
              )
            ),
            ...("s:ref" in this.#attributes
              ? {
                  ref: new Js.Reference(this.#attributes["s:ref"].toString()),
                }
              : {}),
            ...("s:vdom" in this.#attributes
              ? {
                  vdom: new Js.String(this.#attributes["s:vdom"].toString()),
                }
              : {}),
          })
        );
    }
  }

  async ToString(
    context: RenderContext,
    css_hash: string,
    in_slot: string | undefined
  ): Promise<RenderResult> {
    const attribute_entries = await Promise.all(
      Object.keys(this.#attributes)
        .map((k) => [k, this.#attributes[k]] as const)
        .map(
          async ([key, value]) => [key, await Evaluate(value, context)] as const
        )
    );

    const attributes = attribute_entries.reduce(
      (c, [k, v]) => ({ ...c, [k]: v }),
      {} as Record<string, any>
    );

    attributes["data-css-id"] = css_hash;
    if (in_slot) attributes.slot = in_slot;

    switch (this.#tag) {
      case "s:if": {
        if (attributes.check)
          return Join(
            this.#children.map((c) => c.ToString(context, css_hash, undefined))
          );
        return {
          html: "",
          css: "",
          web_components: {},
        };
      }
      case "s:for": {
        const subject = attributes.subject;
        const key = attributes.key;
        if (!Array.isArray(subject))
          throw new Error("s:for subject is not an array");
        return Join(
          subject.map((s) =>
            Join(
              this.#children.map((c) =>
                c.ToString(
                  {
                    ...context,
                    parameters: { ...context.parameters, [key]: s },
                  },
                  css_hash,
                  undefined
                )
              )
            )
          )
        );
      }
      case "s:use": {
        const subject = attributes.get;
        const key = attributes.as;
        return Join(
          this.#children.map((c) =>
            c.ToString(
              {
                ...context,
                parameters: { ...context.parameters, [key]: subject },
              },
              css_hash,
              undefined
            )
          )
        );
      }
      case "s:text": {
        return {
          html: attributes.html ? attributes.use : HtmlEncode(attributes.use),
          css: "",
          web_components: {},
        };
      }
      case "script": {
        throw new Error("Script tags are not allowed in static rendering");
      }
      case "slot": {
        const name = attributes.name ?? "$default";
        return {
          html: context.slots[name] ?? "",
          css: "",
          web_components: {},
        };
      }
      default: {
        const component = context.components[this.#tag];
        if (component) {
          if (component.HasBehaviour) {
            const {
              html: children,
              css,
              web_components,
            } = await Join(
              this.#children.map((c) =>
                c.ToString(context, css_hash, undefined)
              )
            );
            return {
              html: Render({
                tag: this.#tag,
                attributes: attributes,
                children: [children],
              }),
              css,
              web_components: {
                ...web_components,
                [this.#tag]: component,
              },
            };
          } else {
            let css: string = "";
            let web_components: Record<string, Component> = {};
            const slots: Record<string, string> = {};
            for (const c of this.#children) {
              const slot =
                c instanceof Element
                  ? c.#attributes.slot?.toString() ?? "$default"
                  : "$default";

              const result = await c.ToString(context, css_hash, undefined);
              slots[slot] = (slots[slot] ?? "") + result.html;
              css = css + result.css;
              web_components = { ...web_components, ...result.web_components };
            }

            const data = await component.ToString({
              parameters: {
                ...context.parameters,
                self: attributes,
              },
              slots,
              components: context.components,
            });

            return {
              html: data.html,
              css: css + data.css,
              web_components: {
                ...web_components,
                ...data.web_components,
              },
            };
          }
        }

        const {
          html: children,
          css,
          web_components,
        } = await Join(
          this.#children.map((c) => c.ToString(context, css_hash, undefined))
        );
        return {
          html: Render({
            tag: this.#tag,
            attributes: attributes,
            children: [children],
          }),
          css,
          web_components,
        };
      }
    }
  }

  GetWebComponents(context: RenderContext): Record<string, Component> {
    const children = JoinComponents(
      this.#children.map((c) => c.GetWebComponents(context))
    );
    const component = context.components[this.#tag];
    if (component)
      return {
        ...children,
        [this.#tag]: component,
      };
    return children;
  }
}
