import { CreateComponent } from "@ipheion/wholemeal";

customElements.define(
  "wisdom-start",
  CreateComponent(() => import("./components/start.std"))
);
