import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class Literal<T extends string | number | boolean>
  implements ISerialiseable<T>
{
  #structure: T;

  constructor(structure: T) {
    this.#structure = structure;
  }

  Impart(_1: T, _2: IBufferWriter): void {}

  Accept(_: IBufferReader): T {
    return this.#structure;
  }

  Confirm(value: unknown): value is T {
    return value === this.#structure;
  }
}
