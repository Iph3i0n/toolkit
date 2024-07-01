import {
  Array,
  DateTime,
  Literal,
  Record,
  Serialised,
  Struct,
  UTF8,
  Union,
} from "@ipheion/moulding-tin";

export const PushSubscription = new Struct({
  endpoint: new UTF8(),
  expires: new DateTime(),
  parameters: new Record(new UTF8(), new UTF8()),
});

export type PushSubscription = Serialised<typeof PushSubscription>;

export const User = new Union(
  new Struct({
    version: new Literal(1),
    username: new UTF8(),
    email: new UTF8(),
    encrypted_password: new UTF8(),
    registered_at: new DateTime(),
    last_sign_in: new DateTime(),
    servers: new Array(
      new Struct({
        url: new UTF8(),
        joined_at: new DateTime(),
      })
    ),
    biography: new UTF8(),
    push_subscriptions: new Array(PushSubscription),
  })
);

export type User = Serialised<typeof User>;
