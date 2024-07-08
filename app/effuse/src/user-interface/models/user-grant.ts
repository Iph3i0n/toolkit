import { IsDate, IsDictionary, IsObject, IsString, IsType } from "@ipheion/safe-type";

export const UserGrant = IsObject({
  AdminHeaders: IsDictionary(IsString),
  RefreshToken: IsString,
  ServerToken: IsString,
  UserId: IsString,
  Expires: IsDate,
});

export type UserGrant = IsType<typeof UserGrant>;