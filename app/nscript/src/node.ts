import { get_node } from "element-store";
import type RunnerContext from "runner-context";

export default abstract class Node {
  readonly #element: Element;

  constructor(element: Element) {
    this.#element = element;
  }

  protected get element() {
    return this.#element;
  }

  protected require_attribute(name: string) {
    const result = this.#element.getAttribute(name);
    if (!result) throw new Error(`Attribute ${name} is required`);

    return result;
  }

  protected require_text() {
    const result = this.#element.textContent;
    if (!result) throw new Error(`Text content is required`);

    return result;
  }

  protected children_of_type(...tags: Array<string>) {
    return [...this.element.children].filter((c) =>
      tags.includes(c.tagName.toLowerCase())
    );
  }

  protected async map_children(
    input: Record<
      string,
      (ele: Element, ctx: RunnerContext) => Promise<RunnerContext>
    >,
    ctx: RunnerContext
  ) {
    for (const ele of this.children_of_type(...Object(input))) {
      const mapper = input[ele.tagName.toLowerCase()];
      if (!mapper) throw new Error("Invalid mapper");
      ctx = await mapper(ele, ctx);
    }

    return ctx;
  }

  async Process(ctx: RunnerContext): Promise<RunnerContext> {
    for (const child of this.#element.children) {
      const handler = get_node(child);
      if (!handler) continue;
      ctx = await handler.Process(ctx);
    }

    return ctx;
  }
}
