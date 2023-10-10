export { default as Array } from "./data-types/array";
export { default as ASCII } from "./data-types/ascii";
export { default as Bool } from "./data-types/bool";
export { default as Char } from "./data-types/char";
export { default as Double } from "./data-types/double";
export { default as Float } from "./data-types/float";
export { default as Int } from "./data-types/int";
export { default as Long } from "./data-types/long";
export { default as Short } from "./data-types/short";
export { default as Struct } from "./data-types/struct";
export { default as UChar } from "./data-types/u-char";
export { default as UInt } from "./data-types/u-int";
export { default as ULong } from "./data-types/u-long";
export { default as UShort } from "./data-types/u-short";
export { default as UTF8 } from "./data-types/utf-8";
export { default as Empty } from "./data-types/empty";
export { default as DateTime } from "./data-types/date-time";
export { default as Union } from "./data-types/union";
export { default as Intersection } from "./data-types/intersection";
export { default as Literal } from "./data-types/literal";
export { default as Record } from "./data-types/record";
export { default as Buffer } from "./data-types/buffer";
export { default as Optional } from "./data-types/optional";
export type { default as ISerialiseable } from "./data-types/base";

import { BufferReader, BufferWriter } from "./data-types/buffer-extra";
import type ISerialiseable from "./data-types/base";

export type Serialised<T> = T extends ISerialiseable<infer A> ? A : never;

export function Write<TSchema>(
  schema: ISerialiseable<TSchema>,
  input: TSchema
) {
  const writer = new BufferWriter();

  if (!schema.Confirm(input))
    throw new Error("Attempting to serialise invalid type");

  schema.Impart(input, writer);

  return writer.Buffer;
}

export function Read<TSchema>(
  schema: ISerialiseable<TSchema>,
  buffer: ArrayBuffer
) {
  const reader = new BufferReader(buffer);

  return schema.Accept(reader);
}

export { BufferReader, BufferWriter };
