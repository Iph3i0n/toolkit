import {
  IsBoolean,
  IsDate,
  IsDictionary,
  IsObject,
  IsString,
  IsType,
} from "@ipheion/safe-type";

export const Channel = IsObject({
  ChannelId: IsString,
  Type: IsString,
  Name: IsString,
  Public: IsBoolean,
});

export type Channel = IsType<typeof Channel>;
