export class UserPublicProfile {
  readonly #user_id: string;
  readonly #username: string;
  readonly #biography: string;

  constructor(model: {
    readonly UserId: string;
    readonly UserName: string;
    readonly Biography: string;
  }) {
    this.#user_id = model.UserId;
    this.#username = model.UserName;
    this.#biography = model.Biography;
  }
}
