import { Guid, Serialised, Struct } from "@ipheion/moulding-tin";

export const UserEmail = new Struct({
  user_id: new Guid(),
});

export type UserEmail = Serialised<typeof UserEmail>;
