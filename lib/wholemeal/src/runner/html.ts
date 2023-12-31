import { Ast } from "../types/ast";
import EventManager from "./event-manager";

export function RenderElement(element: Ast.Html.Element) {
  const result = document.createElement(element.tag);
  for (const key in element.attr)
    if (element.attr[key] != null) result.setAttribute(key, element.attr[key]);

  const manager = new EventManager(result);
  for (const key in element.handlers) manager.Add(key, element.handlers[key]);

  if (element.ref) element.ref.current = result;

  result.append(...element.children.map(RenderNode));
  return result;
}

export function RenderText(element: Ast.Html.Text) {
  return document.createTextNode(element);
}

export function RenderNode(node: Ast.Html.Node) {
  if (typeof node === "string") return RenderText(node);
  if (!node) return "";
  return RenderElement(node);
}

export function RenderChildren(element: Ast.Html.Element) {
  return element.children.map(RenderNode);
}
