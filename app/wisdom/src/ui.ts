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
  "wisdom-block",
  CreateComponent(() => import("./components/block.std"))
);

customElements.define(
  "content-form",
  CreateComponent(() => import("./components/content-form.std"))
);

customElements.define(
  "slot-manager",
  CreateComponent(() => import("./components/slot-manager.std"))
);

customElements.define(
  "image-manager",
  CreateComponent(() => import("./components/image-manager.std"))
);

customElements.define(
  "wisdom-login",
  CreateComponent(() => import("./components/login.std"))
);

customElements.define(
  "wisdom-home",
  CreateComponent(() => import("./components/home.std"))
);

customElements.define(
  "site-properties",
  CreateComponent(() => import("./components/site-properties.std"))
);

customElements.define(
  "link-manager",
  CreateComponent(() => import("./components/link-manager.std"))
);

