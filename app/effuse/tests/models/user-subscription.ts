import {
  IsDate,
  IsDictionary,
  IsObject,
  IsString,
  IsType,
} from "@ipheion/safe-type";

export const UserSubscription = IsObject({
  Endpoint: IsString,
  Expires: IsDate,
  Keys: IsDictionary(IsString),
});

export type UserSubscription = IsType<typeof UserSubscription>;
