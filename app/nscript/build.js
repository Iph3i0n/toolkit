const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs/promises");

esbuild
  .build({
    entryPoints: [path.resolve(__dirname, "src/bin.ts")],
    bundle: true,
    platform: "node",
    write: false,
  })
  .then((r) => r.outputFiles[0].text)
  .then((r) =>
    fs.writeFile(
      path.relative(__dirname, "bin/index.js"),
      "#!/usr/bin/env node\n" + r
    )
  );
