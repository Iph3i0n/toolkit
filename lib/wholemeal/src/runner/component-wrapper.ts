import { IsArray, IsString } from "@ipheion/safe-type";
import { ComponentBase } from "./component";
import { ElementCreatedEvent } from "./events";

type ComponentFactory = new (ele: HTMLElement) => ComponentBase;

export abstract class ComponentWrapper extends HTMLElement {
  #awaited: ComponentBase | undefined;

  protected abstract readonly props: Promise<Array<string>>;
  protected abstract readonly instance: Promise<ComponentBase>;

  get Wholemeal() {
    return this.#awaited;
  }

  connectedCallback() {
    this.style.display = "none";
    this.style.opacity = "0";

    this.instance.then(async (i: any) => {
      this.#awaited = i;

      await this.props.then((b) => {
        for (const property of b) {
          if (property in this) i[property] = (this as any)[property];
          Object.defineProperty(this, property, {
            get: () => i[property],
            set: (val) => (i[property] = val),
          });
        }
      });

      try {
        this.style.removeProperty("display");
        this.style.removeProperty("opacity");
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
  init: () => Promise<{ default: ComponentFactory } | ComponentFactory>
): CustomElementConstructor {
  let initialised:
    | Promise<{ default: ComponentFactory } | ComponentFactory>
    | undefined;

  const create = () => {
    initialised =
      initialised ??
      init().then((r) => {
        setTimeout(() => {
          document.dispatchEvent(new ElementCreatedEvent());
        });
        return r;
      });

    return initialised;
  };

  return class Element extends ComponentWrapper {
    protected props: Promise<string[]> = create()
      .then((factory) => ("default" in factory ? factory.default : factory))
      .then((factory) =>
        "observedAttributes" in factory &&
        IsArray(IsString)(factory.observedAttributes)
          ? factory.observedAttributes
          : []
      );

    protected instance: Promise<ComponentBase> = create()
      .then((factory) => ("default" in factory ? factory.default : factory))
      .then((factory) => new factory(this));
  };
}
