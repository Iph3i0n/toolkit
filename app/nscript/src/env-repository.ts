import Env from "env";
import Node from "node";
import RunnerContext from "runner-context";

export default class EnvRepository extends Node {
  async Process(ctx: RunnerContext) {
    return await this.children_of_type("env")
      .map((e) => new Env(this, e))
      .reduce(
        (ctx_p, env) =>
          ctx_p.then((ctx) =>
            env.Value(ctx).then((v) => ctx.WithEnvVar(env.Name, v))
          ),
        Promise.resolve(ctx)
      );
  }
}
