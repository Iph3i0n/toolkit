import * as Webpack from "webpack";
import Component from "./xml/component";
import Template from "./compiler/templates/template";

export default function (this: Webpack.LoaderContext<unknown>, source: string) {
  const component = new Component(source);

  const template = new Template(component);

  let result = template.Module;

  return result.join(";");
}
