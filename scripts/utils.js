const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

module.exports = {
  /**
   * Runs the given command as shell and pipes the output to stdio
   * @param {string} cwd The current working directory
   * @param {string} cmd A shell command
   * @returns {Promise<number>} The exit code
   */
  run(cwd, cmd) {
    return new Promise((res, rej) => {
      console.log(`Running command ${cmd} in ${cwd}`);
      const [app, ...args] = cmd.split(" ");
      const child = spawn(app, args, { cwd, env: process.env });

      child.stdout.pipe(process.stdout);
      child.stderr.pipe(process.stderr);

      child.on("close", (code) => {
        if (code === 0) res(code);
        else rej(code);
      });
    });
  },
  /**
   * Reads the specified location into a JS object
   * @param {string} path The location of the file
   * @returns {Promise<unknown>} The JSON as a JS object
   */
  async read_json(path) {
    const text = await fs.readFile(path, "utf-8");
    return JSON.parse(text);
  },
  get yargs() {
    return yargs(hideBin(process.argv));
  },
};
