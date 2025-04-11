import { Network } from "./network";
import { ServicePort } from "./service-port";
import { ServiceVolume } from "./service-volume";

export type ServiceProps = {
  readonly image: string;
  readonly ports: Array<ServicePort>;
  readonly env: Record<string, string>;
  readonly networks: Array<Network>;
  readonly volumes: Array<ServiceVolume>;
  readonly dependencies: Array<Service>;
  readonly no_restart?: boolean;
};

export class Service {
  readonly #id: string;
  readonly #image: string;
  readonly #ports: Array<ServicePort>;
  readonly #env: Record<string, string>;
  readonly #networks: Array<Network>;
  readonly #volumes: Array<ServiceVolume>;
  readonly #dependencies: Array<Service>;
  readonly #no_restart: boolean;

  constructor(id: string, props: ServiceProps) {
    this.#id = id;
    this.#image = props.image;
    this.#ports = props.ports;
    this.#env = props.env;
    this.#networks = props.networks;
    this.#volumes = props.volumes;
    this.#dependencies = props.dependencies;
    this.#no_restart = props.no_restart ?? false;
  }

  get Id() {
    return this.#id;
  }

  Model(docker_compose: any) {
    return {
      ...docker_compose,
      services: {
        ...(docker_compose.services ?? {}),
        [this.#id]: {
          image: this.#image,
          ports: this.#ports.map((p) => p.Model),
          environment: this.#env,
          networks: this.#networks.map((n) => n.Id),
          volumes: this.#volumes.map((v) => v.Model),
          depends_on: this.#dependencies.map((d) => d.#id),
          restart: this.#no_restart ? "no" : "unless-stopped",
        },
      },
    };
  }
}
