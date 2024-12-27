import Component from "../../xml/component";
import * as Ts from "../../ts-writer";

export default class TypingsTemplate {
  readonly #component: Component;

  constructor(component: Component) {
    this.#component = component;
  }

  get Metadata() {
    return this.#component.Metadata;
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
