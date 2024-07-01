import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class Optional<T> implements ISerialiseable<T | null> {
  readonly #structure: ISerialiseable<T>;

  constructor(structure: ISerialiseable<T>) {
    this.#structure = structure;
  }

  Impart(value: T | null, buffer: IBufferWriter): void {
    if (value === null) {
      buffer.Write(1, 0);
    } else {
      buffer.Write(1, 1);
      this.#structure.Impart(value, buffer);
    }
  }

  Accept(buffer: IBufferReader): T | null {
    if (buffer.Read(1)) return this.#structure.Accept(buffer);

    return null;
  }

  Confirm(value: unknown): value is T | null {
    return value === null || this.#structure.Confirm(value);
  }
}
