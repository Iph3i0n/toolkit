import { CreateComponent } from "@ipheion/wholemeal";

customElements.define(
  "o-dropdown",
  CreateComponent(() => import("./dropdown.std"))
);

customElements.define(
  "o-modal",
  CreateComponent(() => import("./modal.std"))
);

customElements.define(
  "o-offcanvas",
  CreateComponent(() => import("./offcanvas.std"))
);

customElements.define(
  "o-toast",
  CreateComponent(() => import("./toast.std"))
);
