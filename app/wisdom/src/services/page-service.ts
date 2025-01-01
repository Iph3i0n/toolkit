import { State } from "state";

export default class PageService {
  readonly #state: State;

  constructor(state: State) {
    this.#state = state;
  }

  get HomePage() {
    for (const [id, match] of this.#state.pages) {
      if (match.parent) continue;
      return {
        id,
        ...match,
      };
    }

    return undefined;
  }

  GetPage(id: string) {
    return this.#state.pages[id];
  }

  GetBlock(id: string) {
    return this.#state.blocks[id];
  }

  GetChildren(id: string) {
    return this.#state.pages
      .Filter((_, p) => p.parent === id)
      .map(([id, p]) => ({ id, ...p }));
  }

  BuildPage(id: string, location: string) {
    
  }
}
