export class GrantExpiredError extends Error {
  constructor() {
    super("Grant expired");
  }
}

export class GrantManager<T> {
  #data: T;
  #expires: number;
  readonly #refresh: (current: T) => Promise<[T, number]>;

  constructor(
    data: T,
    expires: number,
    refresh: (current: T) => Promise<[T, number]>
  ) {
    this.#data = data;
    this.#expires = expires;
    this.#refresh = refresh;
  }

  async GetGrant() {
    try {
      const now = new Date().getTime();
      if (now < this.#expires) return this.#data;

      [this.#data, this.#expires] = await this.#refresh(this.#data);
      return this.#data;
    } catch (err) {
      console.error(err);
      throw new GrantExpiredError();
    }
  }
}
