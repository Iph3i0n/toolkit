export class MatchEvent extends Event {
  readonly #matchs: boolean;
  readonly #params: Record<string, string>;

  constructor(matches: boolean, params: Record<string, string>) {
    super("MatchChanged", { bubbles: true, composed: true });

    this.#matchs = matches;
    this.#params = params;
  }

  get Matches() {
    return this.#matchs;
  }

  get Params() {
    return this.#params;
  }
}
