export class LoadedEvent extends Event {
  constructor() {
    super(LoadedEvent.Key, { bubbles: false });
  }

  static get Key() {
    return "loaded";
  }

  static get ListenerKey() {
    return `$${this.Key}`;
  }
}

export class BeforeRenderEvent extends Event {
  constructor() {
    super(BeforeRenderEvent.Key, { bubbles: false });
  }

  static get Key() {
    return "before-render";
  }

  static get ListenerKey() {
    return `$${this.Key}`;
  }
}

export class RenderEvent extends Event {
  constructor() {
    super(RenderEvent.Key, { bubbles: false });
  }

  static get Key() {
    return "rerendered";
  }

  static get ListenerKey() {
    return `$${this.Key}`;
  }
}

export class ShouldRender extends Event {
  constructor() {
    super(ShouldRender.Key, { bubbles: false });
  }

  static get Key() {
    return "should_render";
  }

  static get ListenerKey() {
    return `$${this.Key}`;
  }
}

export class PropsEvent extends Event {
  #key: string;
  #value: string;
  #old: string;

  constructor(key: string, old: string, value: string) {
    super(PropsEvent.Key, { bubbles: false });
    this.#key = key;
    this.#value = value;
    this.#old = old;
  }

  static get Key() {
    return "props_changed";
  }

  static get ListenerKey() {
    return `$${this.Key}`;
  }

  get Key() {
    return this.#key;
  }

  get Value() {
    return this.#value;
  }

  get Old() {
    return this.#old;
  }
}
