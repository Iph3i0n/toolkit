import { Network } from "./network";
import { Service } from "./service";
import { Volume } from "./volume";

export class DockerCompose {
  readonly #services: Array<Service>;
  readonly #networks: Array<Network>;
  readonly #volumes: Array<Volume>;

  private constructor(
    services: Array<Service>,
    networks: Array<Network>,
    volumes: Array<Volume>
  ) {
    this.#services = services;
    this.#networks = networks;
    this.#volumes = volumes;
  }

  static get Start() {
    return new DockerCompose([], [], []);
  }

  WithService(service: Service) {
    return new DockerCompose(
      [...this.#services, service],
      this.#networks,
      this.#volumes
    );
  }

  WithNetwork(network: Network) {
    return new DockerCompose(
      this.#services,
      [...this.#networks, network],
      this.#volumes
    );
  }

  WithVolume(volume: Volume) {
    return new DockerCompose(this.#services, this.#networks, [
      ...this.#volumes,
      volume,
    ]);
  }

  get Model() {
    return [...this.#services, ...this.#networks, ...this.#volumes].reduce(
      (docker_compose, item) => item.Model(docker_compose),
      {} as any
    );
  }

  FindService(id: string) {
    return this.#services.find((s) => s.Id === id);
  }

  FindNetwork(id: string) {
    return this.#networks.find((n) => n.Id === id);
  }
}
