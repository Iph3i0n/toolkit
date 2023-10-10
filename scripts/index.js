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
  .parse();
