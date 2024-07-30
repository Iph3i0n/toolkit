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

export const CalendarEvent = new Union(
  new Struct({
    version: new Literal(1),
    title: new UTF8(),
    description: new UTF8(),
    organiser: new Guid(),
    created: new DateTime(),
    attending: new Array(new Guid()),
  })
);

export type CalendarEvent = Serialised<typeof CalendarEvent>;

export const CalendarEventList = new Union(
  new Struct({
    version: new Literal(1),
    events: new Array(new Guid()),
  })
);

export type CalendarEventList = Serialised<typeof CalendarEventList>;
