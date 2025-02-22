const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs/promises");
const { default: WholemealLoader } = require("@ipheion/wholemeal/dist/esbuild");
const { WorkerLoader } = require("@ipheion/esbuild-workers");

const external = ["esbuild", "http-server"];

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
    plugins: [WholemealLoader()],
  });

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, "src/app.ts")],
    bundle: true,
    platform: "node",
    outfile: path.resolve(app_dir, "server/app.js"),
    plugins: [WorkerLoader()],
    external,
  });

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, "../../lib/wholemeal/src/mod.ts")],
    bundle: true,
    platform: "node",
    outfile: path.resolve(app_dir, "server/wholemeal.js"),
    external,
  });

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, "src/setup.ts")],
    bundle: true,
    platform: "node",
    outfile: path.resolve(app_dir, "server/setup.js"),
    plugins: [WorkerLoader()],
    external,
  });
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, "src/build.ts")],
    bundle: true,
    platform: "node",
    outfile: path.resolve(app_dir, "server/build.js"),
    plugins: [WorkerLoader()],
    external,
  });

  for (const handler of await fs.readdir(
    path.resolve(__dirname, "src/handlers")
  ))
    await esbuild.build({
      entryPoints: [path.resolve(__dirname, "src/handlers", handler)],
      bundle: true,
      platform: "node",
      outfile: path.resolve(
        app_dir,
        "server/handlers",
        handler.replace(".ts", ".js")
      ),
      plugins: [WorkerLoader()],
      external,
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

  await fs.cp(path.resolve(__dirname, "public"), path.resolve(app_dir), {
    recursive: true,
  });
}

main();
