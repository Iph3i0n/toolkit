import {
  ASCII,
  Guid,
  Struct,
  Optional,
  Array,
  Serialised,
} from "@ipheion/moulding-tin";

export const MediaDir = new Struct({
  slug: new ASCII(),
  parent: new Optional(new Guid()),
  files: new Array(
    new Struct({
      name: new ASCII(),
      local_name: new ASCII(),
    })
  ),
});

export type MediaDir = Serialised<typeof MediaDir>;
