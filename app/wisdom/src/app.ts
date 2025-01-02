import { StartServer } from "@ipheion/puristee";
import Path from "node:path";
import HttpServer from "http-server";
import { i_config_repository } from "bootstrap/integrations/i-config-repository";
import { n_builder_service } from "bootstrap/services/builder-service";
import Chokidar from "chokidar";
import { SetupData } from "setup";

function Build() {
  let timeout: any = 0;

  return () => {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      console.log("Found some changes. Building the app.");
      timeout = 0;
      const builder_service = n_builder_service();
      builder_service.BuildApp();
    }, 10000);
  };
}

export async function StartWisdom(port: number) {
  await SetupData();
  const config = await i_config_repository().GetConfig();
  HttpServer.createServer({
    root: config.dist_dir,
  }).listen(3001, () => console.log(`Preview available on port 3001`));

  StartServer({
    handler_dir: Path.resolve(__dirname, "handlers"),
    port: port,
    threads: parseInt(process.env.THREADS ?? "6"),
  });

  console.log("Watching the dist directory for changes");
  const build = Build();
  (Chokidar.watch(config.dist_dir) as any).on("all", build);
}
