import { IsObject, IsString, IsType } from "@ipheion/safe-type";

export const UserPublicProfile = IsObject({
  UserId: IsString,
  UserName: IsString,
  Biography: IsString,
});

export type UserPublicProfile = IsType<typeof UserPublicProfile>;
