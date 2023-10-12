import GlobalCss from "./global.pss";
import { RenderSheet } from "@ipheion/wholemeal";

export * from "./display";
export * from "./form";
export * from "./layout";
export * from "./overlay";
export * from "./text";
export * from "./unit";
export * from "./global/events/close";
export * from "./global/events/pagination";

const style = document.createElement("style");
style.innerHTML = RenderSheet(GlobalCss());
document.head.append(style);
