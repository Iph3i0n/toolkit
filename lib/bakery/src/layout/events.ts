export class AccordionOpenEvent extends Event {
  readonly #id: string;

  constructor(id: string) {
    super("AccordionOpened", { bubbles: true, composed: true });
    this.#id = id;
  }

  get Id() {
    return this.#id;
  }
}
