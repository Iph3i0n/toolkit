const fs = require("node:fs/promises");
const path = require("node:path");
const { Set } = require("@ipheion/set");

async function main() {
  const data = await fs.readFile(path.resolve(__dirname, "input.txt"), "utf8");

  const list1 = [];
  const list2 = [];

  for (const line of data.split("\n")) {
    const [first, second] = line.split("   ");
    list1.push(first);
    list2.push(second);
  }

  // Solution 1
  console.log(
    new Set(list1.sort())
      .merge(list2.sort())
      .select(([a1, a2]) => Math.abs(a1 - a2))
      .aggregate(0, (item, current) => current + item)
  );

  // Solution 2
  console.log(
    new Set(list1)
      .select((i) => i * list2.filter((l) => l === i).length)
      .aggregate(0, (item, current) => current + item)
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
