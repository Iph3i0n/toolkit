import { CreateComponent } from "@ipheion/wholemeal";

customElements.define(
  "d-alert",
  CreateComponent(() => import("./alert.std"))
);

customElements.define(
  "d-card",
  CreateComponent(() => import("./card.std"))
);

customElements.define(
  "d-carousel",
  CreateComponent(() => import("./carousel.std"))
);

customElements.define(
  "d-listgroup",
  CreateComponent(() => import("./listgroup.std"))
);

customElements.define(
  "d-loading",
  CreateComponent(() => import("./loading.std"))
);

customElements.define(
  "d-panel",
  CreateComponent(() => import("./panel.std"))
);

customElements.define(
  "d-progress",
  CreateComponent(() => import("./progress.std"))
);
