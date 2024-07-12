import Path from "node:path";
import { User } from "local/models/user";
import { Channel } from "./models/channel";
import { Role } from "./models/role";
import { Array, Guid, ULong } from "@ipheion/moulding-tin";
import { Message } from "./models/message";
import { StateReader } from "@ipheion/fs-db";
import CreateServer from "@ipheion/puristee";
import { ServerMetadata } from "./models/server-metadata";
import { ForumTopic, ForumTopicList } from "./models/forum";

export const Schema = {
  users: User,
  channels: Channel,
  roles: Role,
  messages: new Array(Message),
  message_counts: new ULong(),
  channel_subscriptions: new Array(new Guid()),
  server_metadata: ServerMetadata,
  forum_topics: ForumTopic,
  forum_topic_lists: ForumTopicList,
};

export const DataDir = process.env.DATA_DIR ?? "./data";

export type State = StateReader<typeof Schema>;

const Server = CreateServer(Path.resolve(DataDir, "local"), Schema, {
  "Access-Control-Allow-Origin": process.env.UI_URL ?? "*",
  "Access-Control-Allow-Methods": "OPTIONS, GET, PUT, POST, DELETE",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
});

export const Handler = Server.Handler;
export type Handler = typeof Server.Handler;

export const Result = Server.Response;
export type Result = typeof Server.Response;

export const WebSocketHandler = Server.WebSocketHandler;
export type WebSocketHandler = typeof Server.WebSocketHandler;

export const SendWebsocketMessage = Server.SendWebsocketMessage;
