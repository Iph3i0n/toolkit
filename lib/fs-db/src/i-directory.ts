import * as MT from "@ipheion/moulding-tin";

export type Schema = Record<string, MT.ISerialiseable<unknown>>;

type ItemReader<T> = Iterable<[string, T]> & {
  Map<TResult>(mapper: (id: string, item: T) => TResult): Array<TResult>;
  Filter(predicate: (id: string, item: T) => boolean): Array<[string, T]>;
};

export type StateWriter<TSchema extends Schema> = Partial<{
  [TKey in keyof TSchema]: Record<
    string,
    MT.Serialised<TSchema[TKey]> | undefined
  >;
}>;

export type StateReader<TSchema extends Schema> = {
  [TKey in keyof TSchema]: Record<string, MT.Serialised<TSchema[TKey]>> &
    ItemReader<MT.Serialised<TSchema[TKey]>>;
};

export default interface IDirectory<TSchema extends Schema> {
  readonly Model: StateReader<TSchema>;
  Write(data: StateWriter<TSchema>): void;
}
