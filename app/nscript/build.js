const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs/promises");

fs.mkdir(path.relative(__dirname, "bin"))
  .catch(() => {})
  .finally(() =>
    esbuild
      .build({
        entryPoints: [path.resolve(__dirname, "src/bin.ts")],
        bundle: true,
        platform: "node",
        write: false,
        external: ["./xhr-sync-worker.js"],
      })
      .then((r) => r.outputFiles[0].text)
      .then((r) =>
        fs.writeFile(
          path.relative(__dirname, "bin/index.js"),
          "#!/usr/bin/env node\n" + r
        )
      )
  )
  .then(() =>
    fs.cp(
      path.resolve(
        __dirname,
        "../../node_modules/jsdom/lib/jsdom/living/xhr/xhr-sync-worker.js"
      ),
      path.resolve(__dirname, "bin/xhr-sync-worker.js")
    )
  );
