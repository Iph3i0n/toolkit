import { FormManagerElement } from "../../form/base";
import { ComponentWrapper } from "@ipheion/wholemeal";

export function FindForm(submit: HTMLElement): FormManagerElement | undefined {
  const parent = submit.parentElement;
  if (!parent) return undefined;
  if (parent.tagName === "F-FORM" && parent instanceof ComponentWrapper)
    return parent.Wholemeal as FormManagerElement;
  return FindForm(parent);
}
