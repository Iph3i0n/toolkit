import {
  ASCII,
  Struct,
  Buffer,
  Serialised,
  Union,
  Literal,
} from "@ipheion/moulding-tin";

export const ProfilePicture = new Union(
  new Struct({
    version: new Literal(1),
    mime: new ASCII(),
    data: new Buffer(),
  })
);

export type ProfilePicture = Serialised<typeof ProfilePicture>;
