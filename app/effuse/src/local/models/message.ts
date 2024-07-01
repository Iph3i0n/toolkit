import {
  DateTime,
  Guid,
  Serialised,
  Struct,
  UTF8,
} from "@ipheion/moulding-tin";

export const Message = new Struct({
  text: new UTF8(),
  when: new DateTime(),
  user: new Guid(),
});

export type Message = Serialised<typeof Message>;
