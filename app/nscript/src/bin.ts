import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import ScriptsFile from "scripts-file";
import RunnerContext from "runner-context";

yargs(hideBin(process.argv))
  .command(
    "[script] [args...]",
    "Run a script",
    (yargs) =>
      yargs
        .positional("script", {
          describe: "The script to run",
          demandOption: true,
          type: "string",
        })
        .positional("args", {
          describe: "Passed to the script",
          default: [] as Array<string>,
          array: true,
          type: "string",
        }),
    async (argv) => {
      const scripts_file = new ScriptsFile(process.cwd(), "scriptsfile.html");
      let ctx = RunnerContext.Start(argv.script, argv.args, scripts_file);
      ctx = await scripts_file.Process(ctx);
      ctx.Done();
    }
  )
  .parse();
