// @ts-check
const fs = require("node:fs/promises");
const path = require("node:path");
const { Set } = require("@ipheion/set");

async function main() {
  const data = await fs.readFile(path.resolve(__dirname, "input.txt"), "utf8");

  const columnes = data.split("\n")[0].length;
  const rows = data.split("\n").length;
  const line_length = columnes + 1;

  /**
   * @param {number} x
   * @param {number} y
   * @returns {string}
   */
  const read = (x, y) => data[x + y * line_length] ?? "P";

  /**
   * @param {[number, number]} start
   * @returns
   */
  const check = ([x, y]) => {
    if (read(x, y) !== "A") return false;

    /** @type {Array<[number, number, number, number]>} */
    const points = [
      [x + 1, y + 1, x - 1, y - 1],
      [x + 1, y - 1, x - 1, y + 1],
      [x - 1, y + 1, x + 1, y - 1],
      [x - 1, y - 1, x + 1, y + 1],
    ];

    for (const [x1, y1, x2, y2] of points) {
      if (
        (read(x1, y1) === "M" && read(x2, y2) === "S") ||
        (read(x1, y1) === "S" && read(x2, y2) === "M")
      )
        continue;
      return false;
    }

    return true;
  };

  let result = 0;
  for (let x = 0; x < columnes; x++) {
    for (let y = 0; y < rows; y++) {
      if (check([x, y])) {
        result += 1;
      }
    }
  }

  console.log(result);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
