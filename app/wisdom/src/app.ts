import { StartServer } from "@ipheion/puristee";
import Path from "node:path";

export function StartWisdom(port: number) {
  StartServer({
    handler_dir: Path.resolve(__dirname, "handlers"),
    port: port,
    threads: parseInt(process.env.THREADS ?? "6"),
  });
}
