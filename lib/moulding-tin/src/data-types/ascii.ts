import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class ASCII implements ISerialiseable<string> {
  Impart(value: string, buffer: IBufferWriter): void {
    for (const char of value) buffer.Write(8, char.charCodeAt(0));

    buffer.Write(8, 0x00);
  }

  Accept(buffer: IBufferReader): string {
    let result = "";

    while (!result.endsWith(String.fromCharCode(0x00)))
      result += String.fromCharCode(buffer.Read(8));

    return result.substring(0, result.length - 1);
  }

  Confirm(value: unknown): value is string {
    return typeof value === "string";
  }
}
