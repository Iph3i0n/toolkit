#!/usr/bin/env node

const { yargs } = require("./utils");
const { run_package } = require("./run");

yargs
  .command(
    "build",
    "The specified workspace",
    () => ({}),
    (args) => run_package(".", "build")
  )
  .command(
    "run [task]",
    "The specified workspace",
    () => ({}),
    (args) => run_package(".", args.task)
  )
  .parse();
