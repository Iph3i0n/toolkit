import { Array, Bool, Serialised, Struct, UTF8 } from "@ipheion/moulding-tin";
import { UserPolicy } from "./user-policy";

export const Role = new Struct({
  name: new UTF8(),
  admin: new Bool(),
  policies: new Array(UserPolicy),
});

export type Role = Serialised<typeof Role>;
