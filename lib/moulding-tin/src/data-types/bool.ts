import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class Bool implements ISerialiseable<boolean> {
  Impart(value: boolean, buffer: IBufferWriter): void {
    buffer.Write(1, value ? 1 : 0);
  }

  Accept(buffer: IBufferReader): boolean {
    return !!buffer.Read(1);
  }

  Confirm(value: unknown): value is boolean {
    return typeof value === "boolean";
  }
}
