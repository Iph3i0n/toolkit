import { HtmlEncode, Wrap } from "./text-render";

type ElementModel = {
  tag: string;
  attributes: Record<string, string>;
  children: Array<ElementModel | string>;
};

export function Render(element: ElementModel): string {
  return Wrap(
    element.children
      .map((c) => (typeof c === "string" ? c : Render(c)))
      .join(""),
    Wrap(
      [
        element.tag,
        ...Object.keys(element.attributes)
          .map((k) => [k, element.attributes[k]] as const)
          .map(([key, value]) =>
            [HtmlEncode(key), Wrap(HtmlEncode(value), '"')].join("=")
          ),
      ].join(" "),
      "<",
      ">"
    ),
    Wrap(element.tag, "</", ">")
  );
}
