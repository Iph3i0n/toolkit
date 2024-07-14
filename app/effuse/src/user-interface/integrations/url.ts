import { ComponentBase } from "@ipheion/wholemeal";

export function UseUrlParameters(self: ComponentBase, pattern: string) {
  document.addEventListener("NavigationEvent", function handler() {
    self.should_render();
    document.removeEventListener("NavigationEvent", handler);
  });

  const current_parts = location.pathname.split("/").filter((r) => r);
  const target_parts = pattern.split("/").filter((r) => r);

  const result: Record<string, string> = {};
  for (let i = 0; i < target_parts.length; i++)
    if (!target_parts[i].startsWith(":"))
      if (target_parts[i] !== current_parts[i]) return {};
      else continue;
    else if (!current_parts[i]) return {};
    else result[target_parts[i].replace(":", "")] = current_parts[i];

  return result;
}
