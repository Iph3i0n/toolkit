import Path from "node:path";
import { Server } from "$sso/server";

Server.Start(Path.resolve(__dirname, "handlers/sso"), 3000);
