import { Struct, Guid, Enum, Serialised } from "@ipheion/moulding-tin";

export const UserPolicy = new Struct({
  channel_id: new Guid(),
  access: new Enum("Read", "Write"),
});

export type UserPolicy = Serialised<typeof UserPolicy>;
