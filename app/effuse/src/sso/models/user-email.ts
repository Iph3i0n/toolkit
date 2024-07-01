import {
  Guid,
  Literal,
  Serialised,
  Struct,
  Union,
} from "@ipheion/moulding-tin";

export const UserEmail = new Union(
  new Struct({
    version: new Literal(1),
    user_id: new Guid(),
  })
);

export type UserEmail = Serialised<typeof UserEmail>;
