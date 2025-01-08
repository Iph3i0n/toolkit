import { State } from "state";
import { Block } from "state/block";
import { Page } from "state/page";

type SlotInfo = {
  id: string;
  preview: string;
};

type Slots = Record<string, Array<SlotInfo>>;

type TreePage = Page & {
  children: Record<string, TreePage>;
  slot_previews: Slots;
  url: string;
};

type PagePreview = Page & {
  id: string;
  slot_previews: Slots;
  breadcrumbs: Array<{ id: string; slug: string }>;
};

type BlockPreview = Block & {
  id: string;
  slot_previews: Slots;
};

export default class PageService {
  readonly #state: State;

  constructor(state: State) {
    this.#state = state;
  }

  #process_slots(data: Page | Block): Slots {
    return Object.keys(data.slots).reduce(
      (c, n) => ({
        ...c,
        [n]: data.slots[n]
          .map((s) => [s, this.#state.blocks[s]] as const)
          .map(([id, data]) => ({
            id,
            preview:
              data.slug ??
              data.properties[Object.keys(data.properties)[0]]?.substring(
                0,
                10
              ) ??
              id,
          })),
      }),
      {} as Slots
    );
  }

  get HomePage() {
    for (const [id, match] of this.#state.pages) {
      if (match.parent) continue;
      return this.GetPage(id);
    }

    return undefined;
  }

  TreePage(id: string): TreePage {
    const match = this.GetPage(id);
    const children = this.#state.pages
      .Filter((_, p) => p.parent === id)
      .reduce(
        (c, [id]) => ({ ...c, [id]: this.TreePage(id) }),
        {} as Record<string, TreePage>
      );

    const url_parts = [match.slug];
    let current = this.#state.pages[id];
    while (current.parent) {
      const id = current.parent;
      current = this.#state.pages[id];
      // We exclude the home page as it is not used in the url
      if (current.parent) url_parts.push(current.slug);
    }

    return {
      ...match,
      children,
      url: "/" + url_parts.reverse().join("/"),
    };
  }

  get Tree() {
    const match = this.HomePage;
    if (!match) throw new Error("No home page configured");
    return this.TreePage(match.id);
  }

  GetPage(id: string): PagePreview {
    const match = this.#state.pages[id];

    const breadcrumbs = [];
    let current = match;
    while (current.parent) {
      const id = current.parent;
      current = this.#state.pages[id];
      breadcrumbs.push({ id, slug: current.slug });
    }

    return {
      id,
      ...match,
      slot_previews: this.#process_slots(match),
      breadcrumbs: breadcrumbs.reverse(),
    };
  }

  GetBlock(id: string): BlockPreview {
    const match = this.#state.blocks[id];
    return {
      id,
      ...match,
      slot_previews: this.#process_slots(match),
    };
  }

  GetChildren(id: string) {
    return this.#state.pages
      .Filter((_, p) => p.parent === id)
      .map(([id, p]) => ({ id, ...p }));
  }
}
