import { Ast } from "./ast";

// deno-lint-ignore no-namespace
export namespace Runner {
  export interface IComponent extends HTMLElement {
    readonly props: Record<string, string>;
    readonly internals: ElementInternals;
    readonly root: ShadowRoot;
  }

  export type ComponentFunction = (
    this: IComponent
  ) => Promise<{ html: () => Ast.Html.Dom; css: () => Ast.Css.Sheet }>;

  export type ValueSets = {
    name: string;
    values: {
      name: string;
      description?: string | undefined;
      references?:
        | {
            name: string;
            url: string;
          }[]
        | undefined;
    }[];
  }[];
}
