import {
  ASCII,
  Guid,
  Struct,
  Optional,
  Array,
  Serialised,
  Buffer,
  UTF8,
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

export const File = new Struct({
  data: new Buffer(),
  mime: new UTF8(),
});

export type File = Serialised<typeof File>;
