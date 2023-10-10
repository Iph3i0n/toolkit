import { BitMax } from "./utils";

function* GetBits(data: Iterable<number>): Generator<number> {
  for (const byte of data) for (let i = 0; i < 8; i++) yield (byte >> i) & 1;
}

export class BufferReader {
  #data: Generator<number>;

  constructor(data: ArrayBuffer) {
    this.#data = GetBits(new Uint8Array(data));
  }

  get #next() {
    const item = this.#data.next();
    if (item.done) throw new Error("Not enough bytes left to read value");

    return item.value;
  }

  Read(bits: number) {
    let result = 0;

    for (let i = 0; i < bits; i++) {
      result += this.#next << i;
    }

    return result;
  }
}

export class BufferWriter {
  #data: Array<number> = [];

  Write(bits: number, value: number) {
    if (value > BitMax(bits) || value < 0 || value % 1 !== 0)
      throw new Error(
        `Values must be an integer between 0 and the bit max. Maximum is ${BitMax(
          bits
        )} and the value is ${value}`
      );
    for (let i = 0; i < bits; i++) this.#data.push((value >> i) & 1);
  }

  get Buffer() {
    const input: number[] = [];

    for (let i = 0; i < this.#data.length; i += 8) {
      let next = 0;
      for (let x = 0; x < 8; x++) {
        const target = i + x;
        if (target < this.#data.length) next += this.#data[target] << x;
      }

      input.push(next);
    }

    return new Uint8Array(input);
  }
}
