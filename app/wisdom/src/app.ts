import { StartServer } from "@ipheion/puristee";
import Path from "node:path";
import HttpServer from "http-server";
import { i_config_repository } from "bootstrap/integrations/i-config-repository";

export async function StartWisdom(port: number) {
  const config = await i_config_repository().GetConfig();
  HttpServer.createServer({
    root: config.dist_dir,
  }).listen(3001, () =>
    console.log(`Preview available on port 3001`)
  );

  StartServer({
    handler_dir: Path.resolve(__dirname, "handlers"),
    port: port,
    threads: parseInt(process.env.THREADS ?? "6"),
  });
}
