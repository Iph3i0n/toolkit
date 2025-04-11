import { DockerCompose } from "docker-compose";
import { IConstruct } from "./construct";

export abstract class Compileable {
  abstract get resources(): Array<IConstruct>;

  async Compile(
    dir: string,
    docker_compose: DockerCompose
  ): Promise<DockerCompose> {
    return await this.resources.reduce(
      (docker_compose_promise, construct) =>
        docker_compose_promise.then((docker_compose) =>
          construct.Compile(dir, docker_compose)
        ),
      Promise.resolve(docker_compose)
    );
  }
}
