import CreateServer from "@ipheion/puristee";
import Path from "node:path";

export const DataDir = process.env.DATA_DIR ?? "./data";

const Server = CreateServer(Path.resolve(DataDir), {});

export const Handler = Server.Handler;

export type Handler = typeof Server.Handler;

export const Result = Server.Response;

export type Result = typeof Server.Response;
