import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

yargs(hideBin(process.argv))
  .command(
    "[script] [args...]",
    "Run a script",
    (yargs) =>
      yargs
        .positional("script", {
          describe: "The script to run",
          demandOption: true,
        })
        .positional("args", {
          describe: "Passed to the script",
          default: [],
          array: true,
          type: "string",
        }),
    (argv) => {}
  )
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .parse();
