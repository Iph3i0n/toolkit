#!/usr/bin/env node
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const { StartWisdom } = require("../dist/server/app");

yargs(hideBin(process.argv))
  .command(
    "serve [port]",
    "start the server",
    (yargs) => {
      return yargs.positional("port", {
        describe: "port to bind on",
        default: 3000,
      });
    },
    (argv) => {
      if (argv.verbose) console.info(`start server on :${argv.port}`);
      StartWisdom(argv.port);
    }
  )
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .parse();
