import { CreateComponent } from "@ipheion/wholemeal";

export * from "./each.std";
export * from "./fetch.std";
export * from "./if.std";
export * from "./paginator.std";
export * from "./route.std";
export * from "./text.std";
export * from "./use.std";

customElements.define(
  "u-each",
  CreateComponent(() => import("./each.std"))
);

customElements.define(
  "u-fetch",
  CreateComponent(() => import("./fetch.std"))
);

customElements.define(
  "u-if",
  CreateComponent(() => import("./if.std"))
);

customElements.define(
  "u-paginator",
  CreateComponent(() => import("./paginator.std"))
);

customElements.define(
  "u-route",
  CreateComponent(() => import("./route.std"))
);

customElements.define(
  "u-text",
  CreateComponent(() => import("./text.std"))
);

customElements.define(
  "u-use",
  CreateComponent(() => import("./use.std"))
);
