import {
  Array,
  ASCII,
  Guid,
  Optional,
  Record,
  Struct,
  UTF8,
  Serialised,
} from "@ipheion/moulding-tin";

export const Page = new Struct({
  slug: new ASCII(),
  layout: new UTF8(),
  parent: new Optional(new Guid()),
  properties: new Record(new ASCII(), new UTF8()),
  slots: new Record(new ASCII(), new Array(new Guid())),
});

export type Page = Serialised<typeof Page>;
