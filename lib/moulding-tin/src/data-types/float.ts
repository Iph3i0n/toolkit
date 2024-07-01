import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class Float implements ISerialiseable<number> {
  Impart(value: number, buffer: IBufferWriter): void {
    const data = new ArrayBuffer(4);
    new DataView(data).setFloat32(0, value, false);
    for (const item of new Uint8Array(data)) buffer.Write(8, item);
  }

  Accept(buffer: IBufferReader): number {
    const data = new Uint8Array([
      buffer.Read(8),
      buffer.Read(8),
      buffer.Read(8),
      buffer.Read(8),
    ]).buffer;

    return new DataView(data).getFloat32(0, false);
  }

  Confirm(value: unknown): value is number {
    return typeof value === "number";
  }
}
