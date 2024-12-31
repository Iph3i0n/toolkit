export class LoadedEvent extends Event {
  constructor() {
    super(LoadedEvent.Key, { bubbles: false });
  }

  static get Key() {
    return "loaded" as const;
  }

  static get ListenerKey() {
    return `$${this.Key}` as const;
  }
}

export class ElementCreatedEvent extends Event {
  constructor() {
    super(ElementCreatedEvent.Key, { bubbles: false });
  }

  static get Key() {
    return "element-created" as const;
  }

  static get ListenerKey() {
    return `$${this.Key}` as const;
  }
}

export class BeforeRenderEvent extends Event {
  constructor() {
    super(BeforeRenderEvent.Key, { bubbles: false });
  }

  static get Key() {
    return "before-render" as const;
  }

  static get ListenerKey() {
    return `$${this.Key}` as const;
  }
}

export class RenderEvent extends Event {
  constructor() {
    super(RenderEvent.Key, { bubbles: false });
  }

  static get Key() {
    return "rerendered" as const;
  }

  static get ListenerKey() {
    return `$${this.Key}` as const;
  }
}

export class ShouldRender extends Event {
  constructor() {
    super(ShouldRender.Key, { bubbles: false });
  }

  static get Key() {
    return "should_render" as const;
  }

  static get ListenerKey() {
    return `$${this.Key}` as const;
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
    return "props_changed" as const;
  }

  static get ListenerKey() {
    return `$${this.Key}` as const;
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

export function OnElementLoaded(handler: () => void) {
  document.addEventListener(ElementCreatedEvent.Key, handler);

  return () => document.removeEventListener(ElementCreatedEvent.Key, handler);
}
