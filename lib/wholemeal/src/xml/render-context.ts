import type Component from "./component";

export type RenderContext = {
  parameters: Record<string, unknown>;
  slots: Record<string, string>;
  components: Record<string, Component>;
  css: Record<string, string>;
  include_web_components: Record<string, Component>;
};
