import { DockerCompose } from "docker-compose";
import { Compileable } from "./compileable";

export interface IConstruct {
  register(self: IConstruct): void;
  get Id(): string;
  Compile(dir: string, docker_compose: DockerCompose): Promise<DockerCompose>;
}

export abstract class Construct extends Compileable implements IConstruct {
  readonly #scope: IConstruct;
  readonly #id: string;
  readonly #resources: Array<IConstruct> = [];

  constructor(scope: IConstruct, id: string) {
    super();
    this.#scope = scope;
    this.#id = id;

    scope.register(this);
  }

  get Id() {
    return [this.#scope.Id, this.#id].filter((r) => r).join("_");
  }

  register(self: IConstruct) {
    this.#resources.push(self);
  }

  get resources() {
    return this.#resources;
  }
}
