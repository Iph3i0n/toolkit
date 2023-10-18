import ContextFetcher from "../../global/base-classes/context-fetcher";
import BakeryBase from "../../global/base-classes/main";
import Router from "../../global/base-classes/router";
import { RenderEvent } from "@ipheion/wholemeal";

export function is_visible(self: BakeryBase) {
  let current = self.parentElement;

  while (current && current.tagName !== "BODY") {
    const fail = (still_failing: () => boolean) => {
      current?.addEventListener(RenderEvent.Key, function handler() {
        if (still_failing()) return;

        self.should_render();
        current?.removeEventListener(RenderEvent.Key, handler);
      });

      return false;
    };

    const instance: BakeryBase = (current as any).Wholemeal;
    if (!instance) {
      current = current.parentElement;
      continue;
    }

    if (
      instance.tagName === "U-IF" &&
      instance instanceof ContextFetcher &&
      !instance.use_string_context("check")
    )
      return fail(
        () =>
          instance?.tagName === "U-IF" &&
          instance instanceof ContextFetcher &&
          !instance.use_string_context("check")
      );
    if (instance instanceof Router && !instance.CurrentlyMatching)
      return fail(
        () => instance instanceof Router && !instance.CurrentlyMatching
      );
    if (instance.tagName === "U-EACH")
      return fail(() => instance?.tagName === "U-EACH");
    current = instance.parentElement;
  }

  return true;
}
