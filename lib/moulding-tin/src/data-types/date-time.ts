import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class DateTime implements ISerialiseable<Date> {
  Impart(value: Date, buffer: IBufferWriter): void {
    buffer.Write(16, value.getFullYear());
    buffer.Write(5, value.getMonth());
    buffer.Write(5, value.getDate());

    buffer.Write(6, value.getHours());
    buffer.Write(6, value.getMinutes());
    buffer.Write(6, value.getSeconds());
    buffer.Write(10, value.getMilliseconds());
  }

  Accept(buffer: IBufferReader): Date {
    return new Date(
      buffer.Read(16),
      buffer.Read(5),
      buffer.Read(5),
      buffer.Read(6),
      buffer.Read(6),
      buffer.Read(6),
      buffer.Read(10)
    );
  }

  Confirm(value: unknown): value is Date {
    return value instanceof Date;
  }
}
