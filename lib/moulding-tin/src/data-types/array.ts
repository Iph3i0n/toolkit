import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class Sequence<T> implements ISerialiseable<Array<T>> {
  #structure: ISerialiseable<T>;

  constructor(structure: ISerialiseable<T>) {
    this.#structure = structure;
  }

  Impart(value: Array<T>, buffer: IBufferWriter): void {
    for (const v of value) {
      buffer.Write(1, 1);
      this.#structure.Impart(v, buffer);
    }

    buffer.Write(1, 0);
  }

  Accept(buffer: IBufferReader): Array<T> {
    const result: Array<T> = [];
    while (buffer.Read(1)) result.push(this.#structure.Accept(buffer));

    return result;
  }

  Confirm(value: unknown): value is T[] {
    return (
      Array.isArray(value) && !value.find((v) => !this.#structure.Confirm(v))
    );
  }
}
