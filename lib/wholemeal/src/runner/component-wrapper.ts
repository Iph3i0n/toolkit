import { ComponentBase } from "./component";

type ComponentFactory = new (ele: HTMLElement) => ComponentBase;

export abstract class ComponentWrapper extends HTMLElement {
  #awaited: ComponentBase | undefined;

  constructor() {
    super();

    setImmediate(() =>
      this.instance.then((b) => {
        this.#awaited = b;
      })
    );
  }

  protected abstract readonly instance: Promise<ComponentBase>;

  get Wholemeal() {
    return this.#awaited;
  }

  connectedCallback() {
    this.style.display = "none";

    this.instance.then((i) => {
      try {
        this.style.removeProperty("display");
        i.connectedCallback();
      } catch (err) {
        console.error(err);
      }
    });
  }

  disconnectedCallback() {
    this.instance.then((i) => i.disconnectedCallback());
  }

  adoptedCallback() {
    this.instance.then((i) => i.adoptedCallback());
  }

  attributeChangedCallback(name: string, old: string, next: string) {
    this.instance.then((i) => i.attributeChangedCallback(name, old, next));
  }

  setAttribute(qualifiedName: string, value: any): void {
    super.setAttribute(qualifiedName, value);
    this.instance.then((i: any) => {
      i[qualifiedName] = value;
    });
  }
}

export default function CreateComponent(
  init: () => Promise<ComponentFactory>
): CustomElementConstructor {
  return class Element extends ComponentWrapper {
    protected instance: Promise<ComponentBase> = init().then(
      (factory) => new factory(this)
    );
  };
}
