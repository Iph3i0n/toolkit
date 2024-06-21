import Component from "../../xml/component";
import * as Ts from "../../ts-writer";
import Path from "node:path";

export default class TypingsTemplate {
  readonly #component: Component;
  readonly #location: string;

  constructor(component: Component, location: string) {
    this.#component = component;
    this.#location = location;
  }

  get Metadata() {
    return this.#component.Metadata;
  }

  get WrapperTypings(): Array<Ts.Any> {
    return [
      new Ts.Import(
        "ComponentWrapper",
        "@ipheion/wholemeal/dist/runner/component-wrapper",
        true
      ),
      new Ts.Import(
        [
          "LoadedEvent",
          "RenderEvent",
          "ShouldRender",
          "PropsEvent",
          "CreateRef",
          "BeforeRenderEvent",
        ],
        "@ipheion/wholemeal",
        false
      ),
      new Ts.Reference(this.Metadata.ScriptImports),
      new Ts.Reference(this.#component.ScriptImports),
      new Ts.Import(
        this.#component.Metadata.ClassName + " as Instance",
        `./${Path.basename(this.#location)}.instance`,
        false
      ),
      new Ts.Export(
        new Ts.Class(
          this.#component.Metadata.ClassName,
          "extends",
          new Ts.Reference("ComponentWrapper"),
          new Ts.Method("Initialiser", new Ts.Reference("Instance"), "get")
        ),
        false
      ),
    ];
  }

  get Typings(): Array<Ts.Any> {
    const m = this.Metadata;
    const base = this.Metadata.Base?.Name ?? "ComponentBase";
    return [
      new Ts.Reference(m.ScriptImports),
      new Ts.Reference(this.#component.ScriptImports),
      new Ts.Export(
        new Ts.Class(
          m.ClassName,
          "extends",
          new Ts.Reference(base),
          ...m.Attr.map(
            (a) =>
              new Ts.Property(
                a.Name,
                new Ts.Reference(a.Type ?? "string"),
                a.Optional
              )
          ),
          ...m.Members.map(
            (a) =>
              new Ts.Property(
                a.Name,
                new Ts.Reference(a.Type ?? "string"),
                a.Optional,
                a.Readonly ? "readonly" : ""
              )
          )
        ),
        false
      ),
    ];
  }
}
