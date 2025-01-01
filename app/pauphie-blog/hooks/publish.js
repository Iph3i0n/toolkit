const fs = require("fs/promises");

module.exports = async function (location) {
  try {
    await fs.mkdir("./res");
  } catch {}

  await fs.cp(location, "./res", { recursive: true });
};
