import { Struct, Guid } from "@ipheion/moulding-tin";

export const UserPolicy = new Struct({
  ChannelId: new Guid(),
});
