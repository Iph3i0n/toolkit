import {
  Bool,
  DateTime,
  Guid,
  Struct,
  Optional,
  Array,
  Serialised,
} from "@ipheion/moulding-tin";
import { UserPolicy } from "./user-policy";

export const User = new Struct({
  joined_server: new DateTime(),
  last_logged_in: new DateTime(),
  banned: new Bool(),
  role: new Optional(new Guid()),
  policies: new Array(UserPolicy),
  admin: new Bool(),
});

export type User = Serialised<typeof User>;
