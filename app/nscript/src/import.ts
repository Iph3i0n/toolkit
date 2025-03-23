import Node from "node";
import RunnerContext from "runner-context";
import ScriptsFile from "scripts-file";

export default class Import extends Node {
  Process(ctx: RunnerContext): Promise<RunnerContext> {
    const script = new ScriptsFile(ctx.Cwd, this.require_attribute("path"));
    return script.Process(ctx.WithScriptsFile(script));
  }
}
