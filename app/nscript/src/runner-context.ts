import type CodeRunner from "code-runner";
import Path from "node:path";
import type Script from "script";
import type ScriptsFile from "scripts-file";
import type Task from "task";

export default class RunnerContext {
  readonly #task_name: string;
  readonly #cwd: string;
  readonly #env: NodeJS.ProcessEnv;
  readonly #tasks: Array<Task>;
  readonly #running: Array<CodeRunner>;
  readonly #original_script: ScriptsFile;

  private constructor(
    task_name: string,
    cwd: string,
    env: NodeJS.ProcessEnv,
    tasks: Array<Task>,
    scripts: Array<Script>,
    original_script: ScriptsFile
  ) {
    this.#task_name = task_name;
    this.#cwd = cwd;
    this.#env = env;
    this.#tasks = tasks;
    this.#running = scripts;
    this.#original_script = original_script;
  }

  static Start(task_name: string, self: ScriptsFile) {
    return new RunnerContext(
      task_name,
      process.cwd(),
      process.env,
      [],
      [],
      self
    );
  }

  get CurrentTarget() {
    return this.#task_name.split(":")[0];
  }

  get Cwd() {
    return this.#cwd;
  }

  get Env() {
    return this.#env;
  }

  WithCompletedSegment() {
    return new RunnerContext(
      this.#task_name.split(":").slice(1).join(":"),
      this.#cwd,
      this.#env,
      this.#tasks,
      this.#running,
      this.#original_script
    );
  }

  WithEnvVar(name: string, value: string) {
    return new RunnerContext(
      this.#task_name,
      this.#cwd,
      {
        ...this.#env,
        [name]: value,
      },
      this.#tasks,
      this.#running,
      this.#original_script
    );
  }

  WithCwd(relative_path: string) {
    return new RunnerContext(
      this.#task_name,
      Path.resolve(this.#cwd, relative_path),
      this.#env,
      this.#tasks,
      this.#running,
      this.#original_script
    );
  }

  WithTask(task: Task) {
    return new RunnerContext(
      this.#task_name,
      this.#cwd,
      this.#env,
      [...this.#tasks, task],
      this.#running,
      this.#original_script
    );
  }

  WithCode(code: CodeRunner) {
    return new RunnerContext(
      this.#task_name,
      this.#cwd,
      this.#env,
      this.#tasks,
      [...this.#running, code],
      this.#original_script
    );
  }
}
