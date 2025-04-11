import { Volume } from "./volume";

export type ServiceVolumeProps = {
  readonly?: boolean;
  nocopy?: boolean;
  subpath?: string;
};

export class ServiceVolume {
  readonly #source: Volume | string;
  readonly #target: string;
  readonly #props: ServiceVolumeProps;

  constructor(
    source: Volume | string,
    target: string,
    props: ServiceVolumeProps = {}
  ) {
    this.#source = source;
    this.#target = target;
    this.#props = props;
  }

  get Model() {
    return {
      type: typeof this.#source === "string" ? "bind" : "volume",
      source: typeof this.#source === "string" ? this.#source : this.#source.Id,
      target: this.#target,
      volume: {
        nocopy: this.#props.nocopy ?? false,
        subpath: this.#props.subpath,
      },
      read_only: this.#props.readonly,
    };
  }
}
