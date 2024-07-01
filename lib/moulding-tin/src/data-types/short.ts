import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class Short implements ISerialiseable<number> {
  Impart(value: number, buffer: IBufferWriter): void {
    buffer.Write(1, value >= 0 ? 1 : 0);
    buffer.Write(16, Math.abs(value));
  }

  Accept(buffer: IBufferReader): number {
    const is_positive = !!buffer.Read(1);
    if (is_positive) return buffer.Read(16);
    return -buffer.Read(8);
  }

  Confirm(value: unknown): value is number {
    return typeof value === "number";
  }
}
