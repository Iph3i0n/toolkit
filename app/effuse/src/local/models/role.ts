import {
  Array,
  Bool,
  Literal,
  Serialised,
  Struct,
  UTF8,
  Union,
} from "@ipheion/moulding-tin";
import { UserPolicy } from "./user-policy";

export const Role = new Union(
  new Struct({
    version: new Literal(1),
    name: new UTF8(),
    admin: new Bool(),
    policies: new Array(UserPolicy),
  })
);

export type Role = Serialised<typeof Role>;
