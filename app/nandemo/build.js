const esbuild = require("esbuild");
const path = require("path");
const fs = require("fs/promises");

const external = ["esbuild", "http-server"];

async function main() {
  const app_dir = path.resolve(__dirname, "dist");

  try {
    await fs.rm(app_dir, { recursive: true });
  } catch {}

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, "src/ui.tsx")],
    bundle: true,
    platform: "browser",
    outdir: path.resolve(app_dir, "ui"),
  });

  await esbuild.build({
    entryPoints: [path.resolve(__dirname, "src/app.ts")],
    bundle: true,
    platform: "node",
    outfile: path.resolve(app_dir, "server/app.js"),
    external,
    sourcemap: "inline",
  });

  await fs.cp(
    path.resolve(__dirname, "../../lib/bakery/dist"),
    path.resolve(app_dir, "bakery"),
    { recursive: true }
  );

  await fs.cp(path.resolve(__dirname, "public"), path.resolve(app_dir, "_"), {
    recursive: true,
  });

  await fs.cp(
    path.resolve(__dirname, "index.html"),
    path.resolve(app_dir, "server/index.html")
  );

  // await fs.cp(path.resolve(__dirname, "public"), path.resolve(app_dir), {
  //   recursive: true,
  // });

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
      external,
    });
}

main();
