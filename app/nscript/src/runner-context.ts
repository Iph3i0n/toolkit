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
  readonly #scripts_file: ScriptsFile;

  private constructor(
    task_name: string,
    cwd: string,
    env: NodeJS.ProcessEnv,
    tasks: Array<Task>,
    scripts: Array<Script>,
    scripts_file: ScriptsFile
  ) {
    this.#task_name = task_name;
    this.#cwd = cwd;
    this.#env = env;
    this.#tasks = tasks;
    this.#running = scripts;
    this.#scripts_file = scripts_file;
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

  get ScriptsFile() {
    return this.#scripts_file;
  }

  WithDependency(task_name: string) {
    return new RunnerContext(
      task_name,
      this.#cwd,
      this.#env,
      this.#tasks,
      this.#running,
      this.#scripts_file
    );
  }

  WithCompletedSegment() {
    return new RunnerContext(
      this.#task_name.split(":").slice(1).join(":"),
      this.#cwd,
      this.#env,
      this.#tasks,
      this.#running,
      this.#scripts_file
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
      this.#scripts_file
    );
  }

  WithCwd(relative_path: string) {
    return new RunnerContext(
      this.#task_name,
      Path.resolve(this.#cwd, relative_path),
      this.#env,
      this.#tasks,
      this.#running,
      this.#scripts_file
    );
  }

  WithTask(task: Task) {
    return new RunnerContext(
      this.#task_name,
      this.#cwd,
      this.#env,
      [...this.#tasks, task],
      this.#running,
      this.#scripts_file
    );
  }

  WithCode(code: CodeRunner) {
    return new RunnerContext(
      this.#task_name,
      this.#cwd,
      this.#env,
      this.#tasks,
      [...this.#running, code],
      this.#scripts_file
    );
  }

  WithScriptsFile(file: ScriptsFile) {
    return new RunnerContext(
      this.#task_name,
      this.#cwd,
      this.#env,
      this.#tasks,
      this.#running,
      file
    );
  }
}
