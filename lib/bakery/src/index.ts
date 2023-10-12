import GlobalCss from "./global.pss";
import { RenderSheet } from "@ipheion/wholemeal";

export * from "./display";
export * from "./area/form";
export * from "./layout";
export * from "./overlay";
export * from "./area/text";
export * from "./area/unit";

const style = document.createElement("style");
style.innerHTML = RenderSheet(GlobalCss());
document.head.append(style);
