export class UserGrant {
  readonly #user_token: string;
  readonly #server_token: string;
  readonly #refresh_token: string;
  readonly #user_id: string;
  readonly #expires: Date;

  constructor(
    user_token: string,
    server_token: string,
    refresh_token: string,
    user_id: string,
    expires: Date
  ) {
    this.#user_token = user_token;
    this.#server_token = server_token;
    this.#refresh_token = refresh_token;
    this.#user_id = user_id;
    this.#expires = expires;
  }

  get UserToken() {
    return this.#user_token;
  }

  get ServerToken() {
    return this.#server_token;
  }

  get RefreshToken() {
    return this.#refresh_token;
  }

  get UserId() {
    return this.#user_id;
  }

  get Expires() {
    return this.#expires;
  }
}
