export class Cache<T> {
  readonly #timeout: number;

  readonly #store: Record<string, [NodeJS.Timeout, T] | undefined> = {};

  constructor(timeout: number) {
    this.#timeout = timeout;
  }

  Set(key: string, data: T) {
    const existing = this.#store[key];
    if (existing) clearTimeout(existing[0]);
    this.#store[key] = [
      setTimeout(() => {
        this.#store[key] = undefined;
      }, this.#timeout),
      data,
    ];
  }

  Get(key: string) {
    const [, result] = this.#store[key] ?? [];

    return result;
  }
}
