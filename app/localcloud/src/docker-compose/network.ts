export type NetworkDriver = "bridge" | "overlay" | "none";

export class Network {
  readonly #id: string;
  readonly #driver: NetworkDriver;
  readonly #isolated: boolean;

  constructor(id: string, driver: NetworkDriver, isolated: boolean) {
    this.#id = id;
    this.#driver = driver;
    this.#isolated = isolated;
  }

  get Id() {
    return this.#id;
  }

  Model(docker_compose: any) {
    return {
      ...docker_compose,
      networks: {
        ...(docker_compose.networks ?? {}),
        [this.#id]: {
          driver: this.#driver,
          internal: this.#isolated,
        },
      },
    };
  }
}
