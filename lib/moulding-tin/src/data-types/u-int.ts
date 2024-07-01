import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class UInt implements ISerialiseable<number> {
  Impart(value: number, buffer: IBufferWriter): void {
    buffer.Write(32, value);
  }

  Accept(buffer: IBufferReader): number {
    return buffer.Read(32);
  }

  Confirm(value: unknown): value is number {
    return typeof value === "number";
  }
}
