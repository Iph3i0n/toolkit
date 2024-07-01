import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class ULong implements ISerialiseable<bigint> {
  Impart(value: bigint, buffer: IBufferWriter): void {
    let binary_string = value.toString(2);
    while (binary_string.length < 64) binary_string = "0" + binary_string;
    for (let i = 0; i < 64; i++)
      buffer.Write(1, binary_string[i] === "1" ? 1 : 0);
  }

  Accept(buffer: IBufferReader): bigint {
    let data = "0b";
    for (let i = 0; i < 64; i++) data += buffer.Read(1).toString();

    return BigInt(data);
  }

  Confirm(value: unknown): value is bigint {
    return typeof value === "bigint";
  }
}
