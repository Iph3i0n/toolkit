import type ScriptsFile from "scripts-file";

export default abstract class Node<TProps> {
  readonly #scope: ScriptsFile;
  readonly #element: Element;
  readonly #props: TProps;

  constructor(scope: ScriptsFile, element: Element, props: TProps) {
    this.#scope = scope;
    this.#element = element;
    this.#props = props;
  }

  protected get scope() {
    return this.#scope;
  }

  protected get element() {
    return this.#element;
  }

  protected get props() {
    return this.#props;
  }
}
