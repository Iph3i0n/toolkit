export class UserSubscription {
  readonly #endpoint: string;
  readonly #expires: Date;
  readonly #keys: Record<string, string>;

  constructor(model: {
    readonly Endpoint: string;
    readonly Expires: string;
    readonly Keys: Record<string, string>;
  }) {
    this.#endpoint = model.Endpoint;
    this.#expires = new Date(model.Expires);
    this.#keys = model.Keys;
  }
}
