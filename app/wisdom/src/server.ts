import CreateServer from "@ipheion/puristee";
import { DataDir, Schema } from "state";

const Server = CreateServer(DataDir, Schema);

export const Handler = Server.Handler;
export type Handler = InstanceType<typeof Handler>;

export const Result = Server.Response;

export type Result = InstanceType<typeof Server.Response>;
