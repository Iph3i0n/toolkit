import {
  Array,
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

    responses: new Array(
      new Struct({
        text: new UTF8(),
        who: new Guid(),
        when: new DateTime(),
      })
    ),
  })
);

export type ForumTopic = Serialised<typeof ForumTopic>;

export const ForumTopicList = new Union(
  new Struct({
    version: new Literal(1),
    data: new Array(new Guid()),
  })
);

export type ForumTopicList = Serialised<typeof ForumTopicList>;
