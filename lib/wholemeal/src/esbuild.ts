import * as EsBuild from "esbuild";
import Fs from "fs/promises";
import Component from "./xml/component";
import Template from "./compiler/templates/template";
import Sheet from "./pss/sheet";

export default function WholemealLoader(): EsBuild.Plugin {
  return {
    name: "wholemeal",
    setup(build) {
      build.onLoad({ filter: /.std$/ }, async (args) => {
        const content = await Fs.readFile(args.path, "utf8");
        const component = new Component(content);
        const template = new Template(component);
        return {
          contents: template.Module.join(";"),
        };
      });

      build.onLoad({ filter: /.pss$/ }, async (args) => {
        const content = await Fs.readFile(args.path, "utf8");
        const sheet = new Sheet(content);
        return {
          contents: ["module.exports", sheet.JavaScript.toString()].join(" = "),
        };
      });
    },
  };
}
