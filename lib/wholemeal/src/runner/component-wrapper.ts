import { ComponentBase } from "./component";

export default abstract class ComponentWrapper<
  TElement extends ComponentBase
> extends HTMLElement {
  #awaited: TElement | undefined;
  readonly #instance: Promise<TElement>;
  #trigger: ((item: TElement) => void) | undefined = undefined;

  constructor() {
    super();
    this.#instance = new Promise((res) => {
      this.#trigger = (item) => {
        this.#awaited = item;
        res(item);
      };
    });
  }

  get Wholemeal() {
    return this.#awaited;
  }

  abstract readonly Initialiser: (self: HTMLElement) => Promise<TElement>;

  connectedCallback() {
    this.style.display = "none";
    this.Initialiser(this).then(this.#trigger);

    this.#instance.then((i) => {
      try {
        this.style.removeProperty("display");
        i.connectedCallback();
      } catch (err) {
        console.error(err);
      }
    });
  }

  disconnectedCallback() {
    this.#instance.then((i) => i.disconnectedCallback());
  }

  adoptedCallback() {
    this.#instance.then((i) => i.adoptedCallback());
  }

  attributeChangedCallback(name: string, old: string, next: string) {
    this.#instance.then((i) => i.attributeChangedCallback(name, old, next));
  }

  // TODO: Add an event listener proxy
}
