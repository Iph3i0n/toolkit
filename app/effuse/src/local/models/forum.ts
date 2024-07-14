import {
  Array,
  Bool,
  DateTime,
  Guid,
  Literal,
  Serialised,
  Struct,
  Union,
  UTF8,
} from "@ipheion/moulding-tin";

export const ForumTopic = new Union(
  new Struct({
    version: new Literal(1),
    title: new UTF8(),
    text: new UTF8(),
    who: new Guid(),
    created: new DateTime(),
    updated: new DateTime(),

    responses: new Array(new Guid()),
  })
);

export type ForumTopic = Serialised<typeof ForumTopic>;

export const ForumTopicList = new Union(
  new Struct({
    version: new Literal(1),
    topics: new Array(
      new Struct({
        id: new Guid(),
        pinned: new Bool(),
        title: new UTF8(),
        when: new DateTime(),
      })
    ),
  })
);

export type ForumTopicList = Serialised<typeof ForumTopicList>;

export const ForumResponse = new Union(
  new Struct({
    version: new Literal(1),
    text: new UTF8(),
    who: new Guid(),
    when: new DateTime(),
  })
);

export type ForumResponse = Serialised<typeof ForumResponse>;
