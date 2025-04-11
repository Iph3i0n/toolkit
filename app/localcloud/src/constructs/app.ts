import { IConstruct } from "./construct";
import { Compileable } from "./compileable";
import { DockerCompose } from "docker-compose";
import Fs from "node:fs/promises";
import Path from "node:path";
import Yaml from "yaml";

export abstract class App extends Compileable implements IConstruct {
  readonly #resources: Array<IConstruct> = [];

  get Id() {
    return "app";
  }

  register(self: IConstruct) {
    this.#resources.push(self);
  }

  get resources() {
    return this.#resources;
  }

  async Build(dir: string) {
    try {
      await Fs.rm(dir, { recursive: true });
    } catch {}

    await Fs.mkdir(dir);
    const docker_compose = await this.Compile(dir, DockerCompose.Start);
    await Fs.writeFile(
      Path.resolve(dir, "docker-compose.yml"),
      Yaml.stringify(docker_compose.Model)
    );
  }
}
