import type Component from "./component";

export type RenderContext = {
  parameters: Record<string, unknown>;
  slots: Record<string, string>;
  components: Record<string, Component>;
};

export type RenderResult = {
  css: string;
  web_components: Record<string, Component>;
  html: string;
};

export function Join(input: Array<Promise<RenderResult>>) {
  return Promise.all(input).then((data) =>
    data.reduce(
      (c, n) => ({
        html: c.html + n.html,
        css: c.css + n.css,
        web_components: { ...c.web_components, ...n.web_components },
      }),
      { html: "", css: "", web_components: {} } as RenderResult
    )
  );
}

export function JoinComponents<T>(input: Array<Record<string, T>>) {
  return input.reduce((c, n) => ({ ...c, ...n }), {} as Record<string, T>);
}
