// deno-lint-ignore-file no-explicit-any
import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

type Structured<TOptions extends any[]> = {
  [TKey in keyof TOptions]: ISerialiseable<TOptions[TKey]>;
};

export class Union<TOptions extends any[]>
  implements ISerialiseable<TOptions[number]>
{
  #structure: Structured<TOptions>;

  constructor(...structure: Structured<TOptions>) {
    this.#structure = structure;
  }

  Impart(value: TOptions[number], buffer: IBufferWriter): void {
    const match_index = this.#structure.findIndex((s) => s.Confirm(value));
    if (match_index === -1)
      throw new Error("No match found during union serialisation");

    const serialiser = this.#structure[match_index];
    buffer.Write(4, match_index);

    serialiser.Impart(value, buffer);
  }

  Accept(buffer: IBufferReader): TOptions[number] {
    const match_index = buffer.Read(4);
    const serialiser = this.#structure[match_index];

    return serialiser.Accept(buffer);
  }

  Confirm(value: unknown): value is TOptions[number] {
    return !!this.#structure.find((s) => s.Confirm(value));
  }
}
