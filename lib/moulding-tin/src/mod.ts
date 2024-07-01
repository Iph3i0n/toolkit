export { Sequence as Array } from "./data-types/array";
export { ASCII } from "./data-types/ascii";
export { Bool } from "./data-types/bool";
export { Char } from "./data-types/char";
export { Double } from "./data-types/double";
export { Float } from "./data-types/float";
export { Int } from "./data-types/int";
export { Long } from "./data-types/long";
export { Short } from "./data-types/short";
export { Struct } from "./data-types/struct";
export { UChar } from "./data-types/u-char";
export { UInt } from "./data-types/u-int";
export { ULong } from "./data-types/u-long";
export { UShort } from "./data-types/u-short";
export { UTF8 } from "./data-types/utf-8";
export { Empty } from "./data-types/empty";
export { DateTime } from "./data-types/date-time";
export { Union } from "./data-types/union";
export { Intersection } from "./data-types/intersection";
export { Literal } from "./data-types/literal";
export { Record } from "./data-types/record";
export { Buffer } from "./data-types/buffer";
export { Guid } from "./data-types/guid";
export { Optional } from "./data-types/optional";
export { Enum } from "./data-types/enum";
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
