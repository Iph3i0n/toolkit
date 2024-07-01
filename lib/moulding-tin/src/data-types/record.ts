// deno-lint-ignore-file no-explicit-any
import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

type VanillaRecord<TKey extends string | number, TValue> = {
  [key in TKey]: TValue;
};

export class Record<TKey extends string | number, TValue>
  implements ISerialiseable<VanillaRecord<TKey, TValue>>
{
  readonly #key: ISerialiseable<TKey>;
  readonly #value: ISerialiseable<TValue>;

  constructor(key: ISerialiseable<TKey>, value: ISerialiseable<TValue>) {
    this.#key = key;
    this.#value = value;
  }

  Impart(value: VanillaRecord<TKey, TValue>, buffer: IBufferWriter): void {
    for (const key in value) {
      buffer.Write(1, 1);
      this.#key.Impart(key, buffer);
      this.#value.Impart(value[key], buffer);
    }

    buffer.Write(1, 0);
  }

  Accept(buffer: IBufferReader): VanillaRecord<TKey, TValue> {
    const result: any = {};

    while (buffer.Read(1)) {
      const key = this.#key.Accept(buffer);
      const value = this.#value.Accept(buffer);
      result[key] = value;
    }

    return result;
  }

  Confirm(value: unknown): value is VanillaRecord<TKey, TValue> {
    if (typeof value !== "object") return false;

    for (const key in value)
      if (!this.#key.Confirm(key) || !this.#value.Confirm((value as any)[key]))
        return false;

    return true;
  }
}
