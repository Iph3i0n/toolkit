import { UserServer } from "./user-server";

export class UserProfile {
  readonly #user_id: string;
  readonly #email: string;
  readonly #username: string;
  readonly #biography: string;
  readonly #registered_at: Date;
  readonly #last_sign_in: Date;
  readonly #servers: Array<UserServer>;

  constructor(model: {
    readonly UserId: string;
    readonly Email: string;
    readonly UserName: string;
    readonly Biography: string;
    readonly RegisteredAt: string;
    readonly LastSignIn: string;
    readonly Servers: Array<{ Url: string; JoinedAt: string }>;
  }) {
    this.#user_id = model.UserId;
    this.#email = model.Email;
    this.#username = model.UserName;
    this.#biography = model.Biography;
    this.#registered_at = new Date(model.RegisteredAt);
    this.#last_sign_in = new Date(model.LastSignIn);
    this.#servers = model.Servers.map((s) => new UserServer(s));
  }

  get UserId() {
    return this.#user_id;
  }

  get Email() {
    return this.#email;
  }

  get UserName() {
    return this.#username;
  }

  get Biography() {
    return this.#biography;
  }

  get RegisteredAt() {
    return this.#registered_at;
  }

  get LastSignIn() {
    return this.#last_sign_in;
  }

  get Servers() {
    return this.#servers;
  }
}
