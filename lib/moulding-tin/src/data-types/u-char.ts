import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class UChar implements ISerialiseable<number> {
  Impart(value: number, buffer: IBufferWriter): void {
    buffer.Write(8, value);
  }

  Accept(buffer: IBufferReader): number {
    return buffer.Read(8);
  }

  Confirm(value: unknown): value is number {
    return typeof value === "number";
  }
}
