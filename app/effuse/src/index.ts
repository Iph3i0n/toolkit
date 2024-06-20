import Path from "node:path";
import { Server } from "./server";

Server.Start(Path.resolve(__dirname, "handlers"), 3000);
