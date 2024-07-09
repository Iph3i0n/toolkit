import { ComponentBase } from "./component";

const loaded_key = "__WHOLEMEAL_INTERNAL__all_loaded_" + crypto.randomUUID();

export default abstract class ComponentWrapper<
  TElement extends ComponentBase
> extends HTMLElement {
  #awaited: ComponentBase | undefined;
  readonly #instance: Promise<ComponentBase>;

  static #loading = 0;

  static readonly #loaded: Record<symbol, ComponentBase> = {};

  constructor() {
    super();

    ComponentWrapper.#loading += 1;
    const id = Symbol();

    this.#instance = new Promise<ComponentBase>((res) => {
      document.addEventListener(loaded_key, () => {
        this.#awaited = ComponentWrapper.#loaded[id];
        res(this.#awaited);
      });

      this.Initialiser(this).then((r) => {
        ComponentWrapper.#loaded[id] = r;
        ComponentWrapper.#loading -= 1;
        if (ComponentWrapper.#loading === 0)
          document.dispatchEvent(new CustomEvent(loaded_key));
      });
    });
  }

  get Wholemeal() {
    return this.#awaited;
  }

  abstract readonly Initialiser: (self: HTMLElement) => Promise<TElement>;

  connectedCallback() {
    this.style.display = "none";

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

  setAttribute(qualifiedName: string, value: any): void {
    super.setAttribute(qualifiedName, value);
    this.#instance.then((i: any) => {
      i[qualifiedName] = value;
    });
  }
}
