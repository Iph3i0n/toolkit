import Path from "node:path";
import CreateServer from "@ipheion/puristee";
import { User } from "sso/models/user";
import { StateReader } from "@ipheion/fs-db";
import { UserEmail } from "sso/models/user-email";
import { ProfilePicture } from "./models/profile";

const InitalState = {
  users: User,
  user_emails: UserEmail,
  pictures: ProfilePicture,
};

export const DataDir = process.env.DATA_DIR ?? "./data";

export type State = StateReader<typeof InitalState>;

export const Server = CreateServer(Path.resolve(DataDir, "db"), InitalState, {
  "Access-Control-Allow-Origin": process.env.UI_URL ?? "*",
  "Access-Control-Allow-Methods": "OPTIONS, GET, PUT, POST, DELETE",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
});

export const Handler = Server.Handler;

export type Handler = typeof Server.Handler;

export const Result = Server.Response;

export type Result = typeof Server.Response;
