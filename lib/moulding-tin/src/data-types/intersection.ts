// deno-lint-ignore-file no-explicit-any
import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

type Structured<TOptions extends any[]> = {
  [TKey in keyof TOptions]: ISerialiseable<TOptions[TKey]>;
};

type UnionToIntersection<T extends unknown[]> = T extends [infer F, ...infer R]
  ? F & UnionToIntersection<R>
  : unknown;

export class Intersection<TOptions extends any[]>
  implements ISerialiseable<UnionToIntersection<TOptions>>
{
  #structure: Structured<TOptions>;

  constructor(...structure: Structured<TOptions>) {
    this.#structure = structure;
  }

  Impart(value: UnionToIntersection<TOptions>, buffer: IBufferWriter): void {
    for (const s of this.#structure) s.Impart(value, buffer);
  }

  Accept(buffer: IBufferReader): UnionToIntersection<TOptions> {
    let result = {} as any;

    for (const s of this.#structure)
      result = { ...result, ...s.Accept(buffer) };

    return result;
  }

  Confirm(value: unknown): value is UnionToIntersection<TOptions> {
    for (const s of this.#structure) if (!s.Confirm(value)) return false;
    return true;
  }
}
