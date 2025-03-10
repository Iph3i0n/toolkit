import { CreateComponent } from "@ipheion/wholemeal";

export * from "./events";
export * from "./types";
export * from "./base";

customElements.define(
  "f-button",
  CreateComponent(() => import("./button.std"))
);

customElements.define(
  "f-code",
  CreateComponent(() => import("./code.std"))
);

customElements.define(
  "f-date",
  CreateComponent(() => import("./date.std"))
);

customElements.define(
  "f-file",
  CreateComponent(() => import("./file.std"))
);

customElements.define(
  "f-form",
  CreateComponent(() => import("./form.std"))
);

customElements.define(
  "f-group",
  CreateComponent(() => import("./group.std"))
);

customElements.define(
  "f-image",
  CreateComponent(() => import("./image.std"))
);

customElements.define(
  "f-input",
  CreateComponent(() => import("./input.std"))
);

customElements.define(
  "f-hidden",
  CreateComponent(() => import("./hidden.std"))
);
customElements.define(
  "f-multiselect",
  CreateComponent(() => import("./multiselect.std"))
);

customElements.define(
  "f-numeric",
  CreateComponent(() => import("./numeric.std"))
);

customElements.define(
  "f-richtext",
  CreateComponent(() => import("./richtext.std"))
);

customElements.define(
  "f-select",
  CreateComponent(() => import("./select.std"))
);

customElements.define(
  "f-singleselect",
  CreateComponent(() => import("./singleselect.std"))
);

customElements.define(
  "f-textarea",
  CreateComponent(() => import("./textarea.std"))
);

customElements.define(
  "f-time",
  CreateComponent(() => import("./time.std"))
);

customElements.define(
  "f-toggle",
  CreateComponent(() => import("./toggle.std"))
);
