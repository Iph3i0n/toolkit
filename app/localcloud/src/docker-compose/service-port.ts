export type ServicePortProps = {
  host_ip?: string;
  protocol?: "tcp" | "udp";
  app_protocol?: string;
};

export class ServicePort {
  readonly #host: number;
  readonly #container: number;
  readonly #props: ServicePortProps;

  constructor(host: number, container: number, props: ServicePortProps = {}) {
    this.#host = host;
    this.#container = container;
    this.#props = props;
  }

  get Model() {
    return {
      target: this.#container,
      published: this.#host,
      host_ip: this.#props.host_ip,
      protocol: this.#props.protocol,
      app_protocol: this.#props.app_protocol,
    };
  }
}
