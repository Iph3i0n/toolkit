import { IsDate, IsObject, IsString, IsType } from "@ipheion/safe-type";

export const UserServer = IsObject({
  Url: IsString,
  JoinedAt: IsDate,
});

export type UserServer = IsType<typeof UserServer>;
