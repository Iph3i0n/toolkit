import {
  Bool,
  DateTime,
  Guid,
  Struct,
  Optional,
  Array,
  Serialised,
  Union,
  Literal,
} from "@ipheion/moulding-tin";
import { UserPolicy } from "./user-policy";

export const User = new Union(
  new Struct({
    version: new Literal(1),
    joined_server: new DateTime(),
    last_logged_in: new DateTime(),
    banned: new Bool(),
    role: new Optional(new Guid()),
    policies: new Array(UserPolicy),
    admin: new Bool(),
  })
);

export type User = Serialised<typeof User>;
