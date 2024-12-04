// @ts-check
const fs = require("node:fs/promises");
const path = require("node:path");
const { Set } = require("@ipheion/set");

async function main() {
  const data = await fs.readFile(path.resolve(__dirname, "input.txt"), "utf8");
  const tolerance = 1;

  console.log(
    new Set(data.split("\n"))
      .select((line) => line.split(" ").map((i) => parseInt(i)))
      .select((line) => {
        const info = new Set(line).aggregate_computed(
          (item) => ({ upCount: 0, downCount: 0, previous: item }),
          (item, { upCount, downCount, previous }) => ({
            previous: item,
            upCount: upCount + (previous < item ? 1 : 0),
            downCount: downCount + (item < previous ? 1 : 0),
          })
        );
        return {
          line,
          up: info.upCount > info.downCount,
        };
      })
      .where(({ line, up }) => {
        const mode = up ? "up" : "down";
        const result =
          new Set(line).aggregate_computed(
            (item) => ({ previous: item, errors: 0 }),
            (item, { previous, errors }) => {
              let valid = true;
              switch (mode) {
                case "up":
                  valid = item - previous <= 3 && item - previous >= 1;
                  break;
                case "down":
                  valid = previous - item <= 3 && previous - item >= 1;
                  break;
              }

              return {
                previous: valid ? item : previous,
                errors: errors + (valid ? 0 : 1),
              };
            }
          ).errors === 0;

        if (!result)
          for (let i = 0; i < line.length; i++) {
            if (
              new Set([
                ...line.slice(0, i),
                ...line.slice(i + 1),
              ]).aggregate_computed(
                (item) => ({ previous: item, errors: 0 }),
                (item, { previous, errors }) => {
                  let valid = true;
                  switch (mode) {
                    case "up":
                      valid = item - previous <= 3 && item - previous >= 1;
                      break;
                    case "down":
                      valid = previous - item <= 3 && previous - item >= 1;
                      break;
                  }

                  return {
                    previous: valid ? item : previous,
                    errors: errors + (valid ? 0 : 1),
                  };
                }
              ).errors === 0
            )
              return true;
          }
        return result;
      })
      .to_array().length
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
