import type CodeRunner from "code-runner";
import Path from "node:path";
import type Script from "script";
import type ScriptsFile from "scripts-file";
import type Task from "task";
import UserInterface from "ui";

type TaskCtx = [Task, Date, Date | undefined];

export default class RunnerContext {
  readonly #task_name: string;
  readonly #args: Array<string>;
  readonly #cwd: string;
  readonly #env: NodeJS.ProcessEnv;
  readonly #tasks: Array<TaskCtx>;
  readonly #running: Array<CodeRunner>;
  readonly #scripts_file: ScriptsFile;

  private constructor(
    task_name: string,
    args: Array<string>,
    cwd: string,
    env: NodeJS.ProcessEnv,
    tasks: Array<TaskCtx>,
    scripts: Array<Script>,
    scripts_file: ScriptsFile
  ) {
    this.#task_name = task_name;
    this.#args = args;
    this.#cwd = cwd;
    this.#env = env;
    this.#tasks = tasks;
    this.#running = scripts;
    this.#scripts_file = scripts_file;
    RunnerContext.#user_interface.SetCtx(this);
  }

  static readonly #user_interface = new UserInterface();

  static Start(task_name: string, args: Array<string>, self: ScriptsFile) {
    return new RunnerContext(
      task_name,
      args,
      process.cwd(),
      process.env,
      [],
      [],
      self
    );
  }

  get FullTarget() {
    return this.#task_name;
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

  get Tasks() {
    return this.#tasks;
  }

  get Scripts() {
    return this.#running;
  }

  WithDependency(task_name: string) {
    return new RunnerContext(
      task_name,
      this.#args,
      this.#scripts_file.FileDir,
      this.#env,
      this.#tasks,
      this.#running,
      this.#scripts_file
    );
  }

  WithCompletedSegment() {
    return new RunnerContext(
      this.#task_name.split(":").slice(1).join(":"),
      this.#args,
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
      this.#args,
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
      this.#args,
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
      this.#args,
      this.#cwd,
      this.#env,
      [...this.#tasks, [task, new Date(), undefined]],
      this.#running,
      this.#scripts_file
    );
  }

  WithFinishedTask(task: Task) {
    const result: Array<TaskCtx> = [];
    for (const [t, s, e] of this.#tasks)
      if (t === task) result.push([t, s, new Date()]);
      else result.push([t, s, e]);

    return new RunnerContext(
      this.#task_name,
      this.#args,
      this.#cwd,
      this.#env,
      result,
      this.#running,
      this.#scripts_file
    );
  }

  WithCode(code: CodeRunner) {
    return new RunnerContext(
      this.#task_name,
      this.#args,
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
      this.#args,
      file.FileDir,
      this.#env,
      this.#tasks,
      this.#running,
      file
    );
  }

  Done(error: boolean) {
    RunnerContext.#user_interface.Done(error);
  }
}
