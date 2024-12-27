import { CreateComponent } from "@ipheion/wholemeal";

customElements.define(
  "t-badge",
  CreateComponent(() => import("./badge.std"))
);

customElements.define(
  "t-code",
  CreateComponent(() => import("./code.std"))
);

customElements.define(
  "t-crumbs",
  CreateComponent(() => import("./crumbs.std"))
);

customElements.define(
  "t-heading",
  CreateComponent(() => import("./heading.std"))
);

customElements.define(
  "t-icon",
  CreateComponent(() => import("./icon.std"))
);

customElements.define(
  "t-link",
  CreateComponent(() => import("./link.std"))
);

customElements.define(
  "t-localised",
  CreateComponent(() => import("./localised.std"))
);

customElements.define(
  "t-paragraph",
  CreateComponent(() => import("./paragraph.std"))
);

customElements.define(
  "t-richtext",
  CreateComponent(() => import("./richtext.std"))
);
