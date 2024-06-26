import { StartServer } from "@ipheion/puristee";
import Path from "node:path";

StartServer({
  handler_dir: Path.resolve(__dirname, "server/handlers"),
  port: 3001,
  threads: parseInt(process.env.THREADS ?? "6"),
});
