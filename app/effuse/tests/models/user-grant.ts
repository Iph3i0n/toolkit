export class UserGrant {
  readonly #admin_token: string;
  readonly #server_token: string;
  readonly #user_id: string;
  readonly #refresh_token: string;
  readonly #expires: Date;

  constructor(model: {
    readonly AdminToken: string;
    readonly ServerToken: string;
    readonly UserId: string;
    readonly RefreshToken: string;
    readonly Expires: string;
  }) {
    this.#admin_token = model.AdminToken;
    this.#server_token = model.ServerToken;
    this.#user_id = model.UserId;
    this.#refresh_token = model.RefreshToken;
    this.#expires = new Date(model.Expires);
  }

  get AdminHeaders() {
    return {
      Authorization: `Bearer ${this.#admin_token}`,
    };
  }

  get ServerHeaders() {
    return {
      Authorization: `Bearer ${this.#server_token}`,
    };
  }

  get RefreshToken() {
    return this.#refresh_token;
  }

  get ServerToken() {
    return this.#server_token;
  }

  get UserId() {
    return this.#user_id;
  }

  get Expires() {
    return this.#expires;
  }
}
