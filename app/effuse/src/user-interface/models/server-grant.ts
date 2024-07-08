import {
  IsBoolean,
  IsDate,
  IsDictionary,
  IsObject,
  IsString,
  IsType,
} from "@ipheion/safe-type";

export const ServerGrant = IsObject({
  LocalHeaders: IsDictionary(IsString),
  IsAdmin: IsBoolean,
  UserId: IsString,
  Expires: IsDate,
});

export type ServerGrant = IsType<typeof ServerGrant>;
