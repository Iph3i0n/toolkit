import Path from "node:path";

export default class RunnerContext {
  readonly #cwd: string;
  readonly #env: NodeJS.ProcessEnv;

  private constructor(cwd: string, env: NodeJS.ProcessEnv) {
    this.#cwd = cwd;
    this.#env = env;
  }

  static get Start() {
    return new RunnerContext(process.cwd(), process.env);
  }

  get Cwd() {
    return this.#cwd;
  }

  get Env() {
    return this.#env;
  }

  WithEnvVar(name: string, value: string) {
    return new RunnerContext(this.#cwd, {
      ...this.#env,
      [name]: value,
    });
  }

  WithCwd(relative_path: string) {
    return new RunnerContext(Path.resolve(this.#cwd, relative_path), this.#env);
  }
}
