import { valid_element } from "element-store";
import Node from "node";
import RunnerContext from "runner-context";
import ScriptsFile from "scripts-file";

@valid_element("import")
export default class Import extends Node {
  Process(ctx: RunnerContext): Promise<RunnerContext> {
    const script = new ScriptsFile(ctx.Cwd, this.require_attribute("path"));
    return script.Process(ctx.WithScriptsFile(script));
  }
}
