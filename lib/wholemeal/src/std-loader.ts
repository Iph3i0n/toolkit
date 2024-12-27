import * as Webpack from "webpack";
import Component from "./xml/component";
import Template from "./compiler/templates/template";
import {
  Assert,
  IsBoolean,
  IsObject,
  IsOneOf,
  Optional,
} from "@ipheion/safe-type";
import TypingsTemplate from "./compiler/typings/template";
import Fs from "node:fs";
import Path from "node:path";
import Json from "comment-json";

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

  const tsconfig = read_json("./tsconfig.json");
  const root_dir = tsconfig?.compilerOptions?.rootDir ?? "./";
  const local_path = Path.relative(root_dir, this.resource);

  const template = new Template(component);
  const typings_template = new TypingsTemplate(component);

  let result = template.Module;

  if (options.typings) {
    this.emitFile(
      local_path.replace(".std", ".std.instance.d"),
      typings_template.Typings.join(";")
    );
  }

  return result.join(";");
}
