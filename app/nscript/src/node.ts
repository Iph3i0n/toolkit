import type ScriptsFile from "scripts-file";

export default abstract class Node {
  readonly #scope: ScriptsFile;
  readonly #element: Element;

  constructor(scope: ScriptsFile, element: Element) {
    this.#scope = scope;
    this.#element = element;
  }

  protected get scope() {
    return this.#scope;
  }

  protected get element() {
    return this.#element;
  }
}
