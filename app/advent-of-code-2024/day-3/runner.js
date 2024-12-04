// @ts-check
const fs = require("node:fs/promises");
const path = require("node:path");
const { Set } = require("@ipheion/set");

async function main() {
  const data = await fs.readFile(path.resolve(__dirname, "input.txt"), "utf8");

  console.log(
    new Set(data.matchAll(/mul\(([0-9]+),([0-9]+)\)/gm))
      .select(([, a, b]) => parseInt(a) * parseInt(b))
      .aggregate(0, (a, b) => a + b)
  );

  console.log(
    new Set(data.split("do()"))
      .select((l) => l.split("don't()")[0])
      .select((l) => l.matchAll(/mul\(([0-9]+),([0-9]+)\)/gm))
      .aggregate(
        0,
        (item, current) =>
          current +
          new Set(item)
            .select(([, a, b]) => parseInt(a) * parseInt(b))
            .aggregate(0, (a, b) => a + b)
      )
  );
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
