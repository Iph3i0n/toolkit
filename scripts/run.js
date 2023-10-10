const { run, read_json } = require("./utils");
const path = require("path");

const already = [];

module.exports = {
  /**
   * @param {string} cwd
   * @param {string} cmd
   */
  async run_package(cwd, cmd) {
    const internal = async (cwd, cmd) => {
      const loc = path.resolve(cwd);
      if (already.find((a) => a === loc)) return;
      const package = await read_json(path.resolve(loc, "package.json"));

      if (!package.scripts[cmd])
        throw new Error(
          `Package ${package.name} does not have a ${cmd} command`
        );

      const requires = package.requires;
      if (Array.isArray(requires)) {
        for (const item of requires)
          await internal(path.resolve(loc, item), cmd);
      }

      already.push(loc);
      await run(loc, "npm run " + cmd);
    };

    await internal(cwd, cmd);
  },
};
