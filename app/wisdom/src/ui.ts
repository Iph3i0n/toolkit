import { CreateComponent } from "@ipheion/wholemeal";

customElements.define(
  "wisdom-start",
  CreateComponent(() => import("./components/start.std"))
);

customElements.define(
  "wisdom-page",
  CreateComponent(() => import("./components/page.std"))
);

customElements.define(
  "content-form",
  CreateComponent(() => import("./components/content-form.std"))
);

customElements.define(
  "slot-manager",
  CreateComponent(() => import("./components/slot-manager.std"))
);
