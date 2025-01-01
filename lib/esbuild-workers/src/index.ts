import * as EsBuild from "esbuild";
import Path from "path";

export function WorkerLoader(): EsBuild.Plugin {
  return {
    name: "worker-loader",
    setup(build) {
      build.onResolve({ filter: /^worker\:\/\// }, (args) => ({
        path: Path.resolve(args.resolveDir, args.path.replace("worker://", "")),
        namespace: "worker",
      }));
      build.onLoad({ filter: /.+/, namespace: "worker" }, async (args) => {
        if (!build.initialOptions.outdir && !build.initialOptions.outfile)
          throw new Error(
            "Must have an out dir or out file for loading workers"
          );
        const output =
          build.initialOptions.outdir ??
          Path.dirname(build.initialOptions.outfile ?? ".");

        const result = await EsBuild.build({
          ...build.initialOptions,
          entryPoints: [args.path],
          write: false,
          splitting: false,
          bundle: true,
          platform: "node",
        });

        return {
          contents: `export default ${JSON.stringify(
            Buffer.from(result.outputFiles[0].contents).toString("utf8")
          )};`,
        };
      });
    },
  };
}
