import {
  Array,
  ASCII,
  Guid,
  Record,
  Serialised,
  Struct,
  UTF8,
  Optional,
} from "@ipheion/moulding-tin";

export const Block = new Struct({
  type: new UTF8(),
  slug: new Optional(new ASCII()),
  properties: new Record(new ASCII(), new UTF8()),
  slots: new Record(new ASCII(), new Array(new Guid())),
});

export type Block = Serialised<typeof Block>;
