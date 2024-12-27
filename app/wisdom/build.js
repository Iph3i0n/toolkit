const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs/promises");

async function main() {
  const app_dir = path.resolve(__dirname, "dist");

  try {
    await fs.rm(app_dir, { recursive: true });
  } catch {}

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, "src/ui.ts")],
    bundle: true,
    platform: "browser",
    splitting: true,
    outdir: path.resolve(app_dir, "ui"),
    format: "esm",
  });

  await fs.cp(
    path.resolve(__dirname, "../../lib/bakery/dist"),
    path.resolve(app_dir, "bakery"),
    { recursive: true }
  );

  await fs.cp(
    path.resolve(__dirname, "index.html"),
    path.resolve(app_dir, "index.html")
  );
}

main();
