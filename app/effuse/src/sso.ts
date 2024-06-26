import { StartServer } from "@ipheion/puristee";
import Path from "node:path";

StartServer({
  handler_dir: Path.resolve(__dirname, "sso/handlers"),
  port: 3000,
  threads: parseInt(process.env.THREADS ?? "6"),
});
