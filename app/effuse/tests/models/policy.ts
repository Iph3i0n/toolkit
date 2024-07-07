import { IsBoolean, IsObject, IsString, IsType } from "@ipheion/safe-type";

export const Policy = IsObject({
  ChannelId: IsString,
  Write: IsBoolean,
});

export type Policy = IsType<typeof Policy>;
