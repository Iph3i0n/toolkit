export default class Url {
  readonly #pattern: string;
  readonly #parameters: Record<string, string | Array<string>>;

  constructor(
    pattern: string,
    parameters: Record<string, string | Array<string>> = {}
  ) {
    this.#pattern = pattern;
    this.#parameters = parameters;
  }

  get Href() {
    return Object.keys(this.#parameters)
      .map((k) => [k, this.#parameters[k]] as const)
      .reduce(
        (c, [key, value]) =>
          typeof value === "string" && c.includes(":" + key)
            ? c.replaceAll(":" + key, value)
            : [
                c,
                Array.isArray(value)
                  ? value
                      .map((v) =>
                        [key, v].map((c) => encodeURIComponent(c)).join("=")
                      )
                      .join("&")
                  : [key, value].map((c) => encodeURIComponent(c)).join("="),
              ].join(c.includes("?") ? "&" : "?"),
        this.#pattern
      );
  }
}
