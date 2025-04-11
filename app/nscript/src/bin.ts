import ScriptsFile from "scripts-file";
import RunnerContext from "runner-context";

import "dep";
import "import";
import "script";
import "task";
import "./path";
import "env";

async function main() {
  let exit_code = 0;
  let error: any | undefined = undefined;
  const [script, ...all_args] = process.argv.slice(2);
  const args = all_args.filter((a) => !a.startsWith("--"));
  const flags = all_args.filter((a) => a.startsWith("--"));
  const scripts_file = ScriptsFile.Fetch(process.cwd(), "scriptsfile.html");
  let ctx = RunnerContext.Start(script, args, scripts_file);
  try {
    ctx = await scripts_file.Process(ctx);
  } catch (err) {
    exit_code = 1;
    error = err;
  } finally {
    ctx.Done(exit_code !== 0);
  }

  if (error) console.error(error);
  process.exit(exit_code);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
