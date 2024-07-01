// deno-lint-ignore-file no-explicit-any
import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

type Structured<T extends Record<string, unknown>> = {
  [TKey in keyof T]: ISerialiseable<T[TKey]>;
};

export class Struct<T extends Record<string, unknown>>
  implements ISerialiseable<T>
{
  #structure: Structured<T>;

  constructor(structure: Structured<T>) {
    this.#structure = structure;
  }

  Impart(value: T, buffer: IBufferWriter): void {
    for (const key in this.#structure)
      this.#structure[key].Impart(value[key], buffer);
  }

  Accept(buffer: IBufferReader): T {
    const result: any = {};
    for (const key in this.#structure)
      result[key] = this.#structure[key].Accept(buffer);

    return result;
  }

  Confirm(value: unknown): value is T {
    return (
      typeof value === "object" &&
      !Object.keys(this.#structure).find(
        (k) => !this.#structure[k].Confirm((value as any)[k])
      )
    );
  }
}
