import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";
import { BitMax } from "./utils";

export class UTF8 implements ISerialiseable<string> {
  Impart(value: string, buffer: IBufferWriter): void {
    for (const char of value) {
      const code = char.charCodeAt(0);
      if (code > BitMax(16)) {
        buffer.Write(1, 1);
        buffer.Write(32, code);
      } else {
        buffer.Write(1, 0);
        buffer.Write(16, code);
      }
    }

    buffer.Write(1, 0);
    buffer.Write(16, 0x00);
  }

  Accept(buffer: IBufferReader): string {
    let result = "";

    while (!result.endsWith(String.fromCharCode(0x00)))
      if (buffer.Read(1)) result += String.fromCharCode(buffer.Read(32));
      else result += String.fromCharCode(buffer.Read(16));

    return result.substring(0, result.length - 1);
  }

  Confirm(value: unknown): value is string {
    return typeof value === "string";
  }
}
