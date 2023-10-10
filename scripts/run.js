const { run, read_json, get_packages } = require("./utils");
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
          for await (const [name, loc] of get_packages())
            if (name === item) await internal(loc, cmd);
      }

      already.push(loc);
      await run(loc, "npm run " + cmd);
    };

    await internal(cwd, cmd);
  },
};
