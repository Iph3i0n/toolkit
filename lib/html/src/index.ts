import { HtmlEncode, Wrap } from "./text-render";

const self_closing = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

type ElementModel = {
  tag: string;
  attributes: Record<string, string | boolean>;
  children: Array<ElementModel | string>;
};

export function Render(element: ElementModel): string {
  if (self_closing.includes(element.tag))
    return Wrap(
      [
        element.tag,
        ...Object.keys(element.attributes)
          .map((k) => [k, element.attributes[k]] as const)
          .map(([key, value]) =>
            [HtmlEncode(key), Wrap(HtmlEncode(value), '"')].join("=")
          ),
      ].join(" "),
      "<",
      "/>"
    );

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
