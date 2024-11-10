import Path from "node:path";
import CreateServer from "@ipheion/puristee";
import { StateReader } from "@ipheion/fs-db";

const InitalState = {};

export const DataDir = process.env.DATA_DIR ?? "./data";

export type State = StateReader<typeof InitalState>;

const Server = CreateServer(Path.resolve(DataDir), InitalState, {});

export const Handler = Server.Handler;

export type Handler = typeof Server.Handler;

export const Result = Server.Response;

export type Result = typeof Server.Response;
