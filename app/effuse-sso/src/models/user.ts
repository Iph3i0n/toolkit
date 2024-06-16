import {
  ASCII,
  Array,
  DateTime,
  Serialised,
  Struct,
  UTF8,
} from "@ipheion/moulding-tin";

export const User = new Struct({
  user_id: new ASCII(),
  email: new UTF8(),
  encrypted_email: new UTF8(),
  registered_at: new DateTime(),
  last_sign_in: new DateTime(),
  servers: new Array(
    new Struct({
      url: new UTF8(),
      joined_at: new DateTime(),
    })
  ),
  biography: new UTF8(),
});

export type User = Serialised<typeof User>;
