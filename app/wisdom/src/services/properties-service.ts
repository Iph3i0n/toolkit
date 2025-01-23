import { State } from "state";
import PageService from "./page-service";

export default class PropertiesService {
  readonly #page_service: PageService;
  readonly #state: State;

  constructor(page_service: PageService, state: State) {
    this.#page_service = page_service;
    this.#state = state;
  }

  #file_url(id: string) {
    for (const [i, v] of this.#state.media) {
      const file = v.files.find((f) => f.local_name === id);
      if (!file) continue;
      const url_parts = [v.slug];
      let current = v;
      if (!current.parent) return `/_images/${file.name}`;
      while (current.parent) {
        const id = current.parent;
        current = this.#state.media[id];
        // We exclude the home page as it is not used in the url
        if (current.parent) url_parts.push(current.slug);
      }

      return "/_files/" + [...url_parts.reverse(), file.name].join("/");
    }

    throw new Error("Could not find image " + id);
  }

  ProcessProps(props: Record<string, string>) {
    const result: Record<string, string> = {};

    for (const item in props) {
      let value = props[item];

      if (value.startsWith("$file:")) {
        const id = value.replace("$file:", "");
        result[item] = this.#file_url(id);
      } else if (value.startsWith("$link:")) {
        const id = value.replace("$link:", "");
        const page = this.#page_service.TreePage(id);
        result[item] = page.url;
      } else {
        for (const [full_match, id] of value.matchAll(
          /"\/api\/v1\/files\/([a-zA-Z0-9\-]+)"/gm
        )) {
          value = value.replace(full_match, this.#file_url(id));
        }
        result[item] = value;
      }
    }

    return result;
  }
}
