export class UserGrant {
  readonly #token: string;
  readonly #user_id: string;
  readonly #expires: Date;

  constructor(token: string, user_id: string, expires: Date) {
    this.#token = token;
    this.#user_id = user_id;
    this.#expires = expires;
  }

  get Token() {
    return this.#token;
  }

  get UserId() {
    return this.#user_id;
  }

  get Expires() {
    return this.#expires;
  }
}
