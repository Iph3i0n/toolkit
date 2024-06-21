export class UserServer {
  readonly #url: string;
  readonly #joined_at: Date;

  constructor(model: { Url: string; JoinedAt: string }) {
    this.#url = model.Url;
    this.#joined_at = new Date(model.JoinedAt);
  }
}
