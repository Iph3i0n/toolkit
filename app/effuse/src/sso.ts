import Path from "node:path";
import { Server } from "$sso/server";

Server.Start(Path.resolve(__dirname, "sso/handlers"), 3000);
