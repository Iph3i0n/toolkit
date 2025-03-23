import type ScriptsFile from "scripts-file";

export default abstract class Node {
  readonly #scope: ScriptsFile;
  readonly #element: Element;

  constructor(scope: ScriptsFile | Node, element: Element) {
    this.#scope = scope instanceof Node ? scope.#scope : scope;
    this.#element = element;
  }

  protected get scope() {
    return this.#scope;
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

  protected children_of_type(tag: string) {
    return [...this.element.children].filter(
      (c) => c.tagName.toLowerCase() === tag
    );
  }
}
