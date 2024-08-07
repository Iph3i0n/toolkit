import * as Webpack from "webpack";
import Component from "./xml/component";
import Template from "./compiler/templates/template";
import ReactTypingsTemplate from "./compiler/typings/react-template";
import PreactTypingsTemplate from "./compiler/typings/preact-template";
import {
  Assert,
  IsBoolean,
  IsLiteral,
  IsObject,
  IsOneOf,
  Optional,
  PatternMatch,
} from "@ipheion/safe-type";
import TypingsTemplate from "./compiler/typings/template";
import Fs from "node:fs";
import Path from "node:path";
import Json from "comment-json";
import PreactTemplate from "./compiler/templates/preact-template";
import ReactTemplate from "./compiler/templates/react-template";

const IsProps = IsObject({
  framework: Optional(IsOneOf("native", "react", "preact")),
  typings: Optional(IsBoolean),
});

function ReadJson(this: Webpack.LoaderContext<unknown>, path: string): any {
  try {
    this.addBuildDependency(path);
    const package_text = Fs.readFileSync(path, "utf-8");
    return Json.parse(package_text);
  } catch {
    return undefined;
  }
}

export default function (this: Webpack.LoaderContext<unknown>, source: string) {
  const read_json = ReadJson.bind(this);
  const options = this.getOptions() ?? {};
  Assert(IsProps, options);

  const component = new Component(source);

  const [js_constructor, typings_constructor] = PatternMatch(
    IsLiteral("native"),
    IsLiteral("react"),
    IsLiteral("preact")
  )(
    () => [Template, TypingsTemplate] as const,
    () => [ReactTemplate, ReactTypingsTemplate] as const,
    () => [PreactTemplate, PreactTypingsTemplate] as const
  )(options.framework ?? "native");

  const tsconfig = read_json("./tsconfig.json");
  const root_dir = tsconfig?.compilerOptions?.rootDir ?? "./";
  const local_path = Path.relative(root_dir, this.resource);

  const template = new js_constructor(component, this.resourcePath);
  const typings_template = new typings_constructor(
    component,
    this.resourcePath
  );
  if (!this.resourceQuery) {
    return template.Wrapper.join(";");
  }

  let result = template.Module;

  if (options.typings) {
    this.emitFile(
      local_path.replace(".std", ".std.instance.d"),
      typings_template.Typings.join(";")
    );

    this.emitFile(
      local_path.replace(".std", ".std.d"),
      typings_template.WrapperTypings.join(";")
    );
  }

  return result.join(";");
}
