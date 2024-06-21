import { ASCII, Serialised, Struct } from "@ipheion/moulding-tin";

export const UserEmail = new Struct({
  user_id: new ASCII(),
});

export type UserEmail = Serialised<typeof UserEmail>;
