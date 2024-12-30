import CreateServer from "@ipheion/puristee";
import { DataDir, Schema } from "state";

const Server = CreateServer(DataDir, Schema);

export const Handler = Server.Handler;
export type Handler = typeof Handler;

export const Result = Server.Response;

export type Result = typeof Server.Response;
