export interface IBufferReader {
  Read(bits: number): number;
}

export interface IBufferWriter {
  Write(bits: number, value: number): void;
}

export default interface ISerialiseable<T> {
  Impart(value: T, buffer: IBufferWriter): void;
  Accept(buffer: IBufferReader): T;

  Confirm(value: unknown): value is T;
}
