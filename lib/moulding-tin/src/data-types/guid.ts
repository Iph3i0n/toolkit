import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

const data_length = 32;

export class Guid implements ISerialiseable<string> {
  Impart(value: string, buffer: IBufferWriter): void {
    const data = value.split("-").join("");
    if (data.length !== data_length) throw new Error("Invalid GUID");
    for (const character of data) {
      const value = character.charCodeAt(0);
      // 48 is char code for 0
      if (value <= 57) buffer.Write(4, value - 48);
      // 97 is char code for a, minus 10 for the previous digits
      else buffer.Write(4, value - 87);
    }
  }

  Accept(buffer: IBufferReader): string {
    let result = "";

    for (let i = 0; i < data_length; i++) {
      const value = buffer.Read(4);
      if (value < 10) result += String.fromCharCode(value + 48);
      else result += String.fromCharCode(value + 87);
    }

    return [
      result.substring(0, 8),
      result.substring(8, 12),
      result.substring(12, 16),
      result.substring(16, 20),
      result.substring(20, 32),
    ].join("-");
  }

  Confirm(value: unknown): value is string {
    return (
      typeof value === "string" &&
      !!value.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/gm
      )
    );
  }
}
