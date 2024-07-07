import {
  Bool,
  Enum,
  Literal,
  Serialised,
  Struct,
  UTF8,
  Union,
} from "@ipheion/moulding-tin";

export const Channel = new Union(
  new Struct({
    version: new Literal(1),
    type: new Enum("Messages", "Forum", "Call", "Calendar"),
    name: new UTF8(),
  })
);

export type Channel = Serialised<typeof Channel>;
