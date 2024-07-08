import {
  IsArray,
  IsDate,
  IsObject,
  IsString,
  IsType,
} from "@ipheion/safe-type";
import { UserServer } from "./user-server";

export const UserProfile = IsObject({
  UserId: IsString,
  Email: IsString,
  UserName: IsString,
  Biography: IsString,
  RegisteredAt: IsDate,
  LastSignIn: IsDate,
  Servers: IsArray(UserServer),
});

export type UserProfile = IsType<typeof UserProfile>;
