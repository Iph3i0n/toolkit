import CreateServer from "@ipheion/puristee";
import { User } from "$sso/m/user";
import { StateReader } from "@ipheion/fs-db";

const InitalState = {
  users: User,
};

export type State = StateReader<typeof InitalState>;

export const Server = CreateServer("./data", InitalState);

export const Handler = Server.Handler;

export type Handler = typeof Server.Handler;

export const Result = Server.Response;

export type Result = typeof Server.Response;
