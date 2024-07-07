import { IsArray, IsBoolean, IsObject, IsString, IsType } from "@ipheion/safe-type";
import { Policy } from "./policy";

export const Role = IsObject({
  RoleId: IsString,
  Name: IsString,
  Admin: IsBoolean,
  Policies: IsArray(Policy),
});

export type Role = IsType<typeof Role>;