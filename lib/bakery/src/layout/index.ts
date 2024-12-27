import { CreateComponent } from "@ipheion/wholemeal";

export * from "./events";

customElements.define(
  "l-accordion",
  CreateComponent(() => import("./accordion.std"))
);

customElements.define(
  "l-col",
  CreateComponent(() => import("./col.std"))
);

customElements.define(
  "l-container",
  CreateComponent(() => import("./container.std"))
);

customElements.define(
  "l-header",
  CreateComponent(() => import("./header.std"))
);

customElements.define(
  "l-row",
  CreateComponent(() => import("./row.std"))
);

customElements.define(
  "l-table-cell",
  CreateComponent(() => import("./table-cell.std"))
);

customElements.define(
  "l-table-row",
  CreateComponent(() => import("./table-row.std"))
);

customElements.define(
  "l-table",
  CreateComponent(() => import("./table.std"))
);

customElements.define(
  "l-templated",
  CreateComponent(() => import("./templated.std"))
);
