import {
  DateTime,
  Guid,
  Literal,
  Serialised,
  Struct,
  UTF8,
  Union,
} from "@ipheion/moulding-tin";

export const Message = new Union(
  new Struct({
    version: new Literal(1),
    text: new UTF8(),
    when: new DateTime(),
    user: new Guid(),
  })
);

export type Message = Serialised<typeof Message>;
