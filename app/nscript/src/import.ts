import { valid_element } from "element-store";
import Node from "node";
import Path from "node:path";
import RunnerContext from "runner-context";
import ScriptsFile from "scripts-file";
import Fs from "node:fs";

@valid_element("import")
export default class Import extends Node {
  async Process(ctx: RunnerContext): Promise<RunnerContext> {
    const main_path = this.require_attribute("path");
    const path = Path.resolve(ctx.Cwd, main_path);
    if (!Fs.existsSync(path))
      throw new Error(`Could not find ${main_path} from ${ctx.Cwd}`);
    const script = ScriptsFile.Fetch(Path.dirname(path), Path.basename(path));
    await script.Process(ctx.WithScriptsFile(script));
    return ctx;
  }
}
