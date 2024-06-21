import Path from "node:path";
import CreateServer from "@ipheion/puristee";
import { User } from "sso/models/user";
import { StateReader } from "@ipheion/fs-db";
import { UserEmail } from "sso/models/user-email";

const InitalState = {
  users: User,
  user_emails: UserEmail,
};

export const DataDir = process.env.DATA_DIR ?? "./data";

export type State = StateReader<typeof InitalState>;

export const Server = CreateServer(Path.resolve(DataDir, "db"), InitalState);

export const Handler = Server.Handler;

export type Handler = typeof Server.Handler;

export const Result = Server.Response;

export type Result = typeof Server.Response;
