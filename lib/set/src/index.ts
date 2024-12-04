export class Set<T> implements Iterable<T> {
  readonly #data: Iterable<T>;

  constructor(data: Iterable<T>) {
    this.#data = data;
  }

  [Symbol.iterator](): Iterator<T, any, any> {
    return this.#data[Symbol.iterator]();
  }

  #build<TResult>(handler: (this: Set<T>) => Iterable<TResult>) {
    return new Set(handler.apply(this));
  }

  merge<TResult>(input: Iterable<TResult>) {
    const it1 = this[Symbol.iterator]();
    const it2 = input[Symbol.iterator]();
    return new Set(
      (function* () {
        let start1 = it1.next();
        let start2 = it2.next();

        while (!start1.done && !start2.done) {
          yield [start1.value, start2.value] as const;
          start1 = it1.next();
          start2 = it2.next();
        }

        if (!start1.done || !start2.done)
          throw new Error("Sequences were not the same length");
      })()
    );
  }

  select<TResult>(selector: (item: T) => TResult) {
    return this.#build(function* () {
      for (const item of this) {
        yield selector(item);
      }
    });
  }

  where(predicate: (item: T) => boolean) {
    return this.#build(function* () {
      for (const item of this) {
        if (predicate(item)) yield item;
      }
    });
  }

  aggregate<TResult>(
    start: TResult,
    aggregator: (item: T, current: TResult) => TResult
  ) {
    for (const item of this) {
      start = aggregator(item, start);
    }

    return start;
  }

  aggregate_computed<TResult>(
    start: (item: T) => TResult,
    aggregator: (item: T, current: TResult) => TResult
  ) {
    let current: TResult | undefined = undefined;
    for (const item of this) {
      if (!current) current = start(item);
      else current = aggregator(item, current);
    }

    return current as TResult;
  }

  to_array() {
    return [...this];
  }
}
