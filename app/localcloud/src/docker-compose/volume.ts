export class Volume {
  readonly #id: string;

  constructor(id: string) {
    this.#id = id;
  }

  get Id() {
    return this.#id;
  }

  Model(docker_compose: any) {
    return {
      ...docker_compose,
      volumes: {
        ...(docker_compose ?? {}),
        [this.#id]: {},
      },
    };
  }
}
