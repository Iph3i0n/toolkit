import IDirectory, { Schema, StateReader, StateWriter } from "./i-directory";
import Fs from "node:fs";
import Path from "node:path";
import * as MT from "@ipheion/moulding-tin";

export default class Directory<TSchema extends Schema>
  implements IDirectory<TSchema>
{
  readonly #schema: TSchema;
  readonly #dir: string;

  constructor(schema: TSchema, dir: string) {
    this.#schema = schema;
    this.#dir = dir;

    if (!this.#exists(this.#join()))
      Fs.mkdirSync(this.#join(), { recursive: true });
  }

  #join(...parts: string[]) {
    return Path.join(this.#dir, ...parts);
  }

  #exists(target: string) {
    try {
      Fs.statSync(target);
      return true;
    } catch (err) {
      return false;
    }
  }

  #read_file(key: string, sub_key: string) {
    const path = this.#join(key, sub_key);

    if (!this.#exists(path)) return undefined;

    const data = Fs.readFileSync(path);
    return MT.Read(this.#schema[key], Buffer.from(data));
  }

  get Model(): StateReader<TSchema> {
    // deno-lint-ignore no-explicit-any
    const result: any = {};
    for (const key in this.#schema)
      Object.defineProperty(result, key, {
        get: () => {
          // deno-lint-ignore no-this-alias
          const self = this;
          // deno-lint-ignore no-explicit-any
          return new Proxy<any>(
            {
              [Symbol.iterator]: function* () {
                if (!self.#exists(self.#join(key))) return;

                for (const sub_key of Fs.readdirSync(self.#join(key))) {
                  yield [sub_key, self.#read_file(key, sub_key)];
                }
              },
              Map<TResult>(
                mapper: (id: string, item: any) => TResult
              ): Array<TResult> {
                if (!self.#exists(self.#join(key))) return [];

                const result: Array<TResult> = [];
                for (const sub_key of Fs.readdirSync(self.#join(key))) {
                  result.push(mapper(sub_key, self.#read_file(key, sub_key)));
                }

                return result;
              },
              Filter(
                predicate: (id: string, item: any) => boolean
              ): Array<any> {
                if (!self.#exists(self.#join(key))) return [];

                const result: Array<any> = [];
                for (const sub_key of Fs.readdirSync(self.#join(key))) {
                  if (predicate(sub_key, self.#read_file(key, sub_key)))
                    result.push([sub_key, self.#read_file(key, sub_key)]);
                }

                return result;
              },
            },
            {
              apply() {
                throw new Error("State items cannot be functions");
              },
              construct() {
                throw new Error("State items cannot be classes");
              },
              defineProperty() {
                throw new Error("The state is immutable");
              },
              deleteProperty() {
                throw new Error("The state is immutable");
              },
              get: (original, sub_key) => {
                if (original[sub_key]) return original[sub_key];

                if (typeof sub_key !== "string")
                  throw new Error("Symbols are not allowed on state");

                return this.#read_file(key, sub_key);
              },
              getOwnPropertyDescriptor: (_, sub_key) => {
                if (typeof sub_key !== "string")
                  throw new Error("Symbols are not allowed on state");

                try {
                  const value = this.#read_file(key, sub_key);
                  return {
                    configurable: false,
                    enumerable: !!value,
                    writable: false,
                    value: value,
                    get: () => {
                      return this.#read_file(key, sub_key);
                    },
                    set() {
                      throw new Error("The state is immutable");
                    },
                  };
                } catch (err) {
                  return undefined;
                }
              },
              getPrototypeOf() {
                return null;
              },

              has: (original, name) => {
                return name in original || this.#exists(name.toString());
              },
              isExtensible() {
                return false;
              },
              ownKeys: () => {
                const response = [];
                for (const part of Fs.readdirSync(this.#dir))
                  response.push(part);
                return response;
              },
              preventExtensions() {
                return true;
              },
              set() {
                throw new Error("The state is immutable");
              },
              setPrototypeOf() {
                return false;
              },
            }
          );
        },
      });

    return result;
  }

  Write(data: StateWriter<TSchema>) {
    for (const key in this.#schema) {
      if (!this.#exists(this.#join(key)))
        Fs.mkdirSync(this.#join(key), { recursive: true });

      const item = data[key];
      if (item)
        for (const part in item)
          if (item[part])
            Fs.writeFileSync(
              this.#join(key, part),
              MT.Write(this.#schema[key], item[part])
            );
          else if (this.#exists(this.#join(key, part)))
            Fs.rmSync(this.#join(key, part));
    }
  }
}
