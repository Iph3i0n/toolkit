import ISerialiseable, { IBufferReader, IBufferWriter } from "./base";

export class Empty implements ISerialiseable<never> {
  Impart(_1: never, _2: IBufferWriter): void {}

  Accept(_: IBufferReader): never {
    return undefined as never;
  }

  Confirm(_: unknown): _ is never {
    return true;
  }
}
