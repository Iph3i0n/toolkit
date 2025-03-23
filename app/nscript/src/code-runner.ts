import Node from "node";
import ChildProcess from "node:child_process";
import { IsOneOf, IsType } from "@ipheion/safe-type";

export type CodeRunnerProps = {
  cwd: string;
  env: Record<string, string>;
};

export const ValidShell = IsOneOf(
  "text/javascript",
  "text/python",
  "text/ruby",
  "shell/bash",
  "shell/zsh",
  "shell/sh"
);

export type ValidShell = IsType<typeof ValidShell>;

export default abstract class CodeRunner extends Node<CodeRunnerProps> {
  #logs: string = "";

  #execute(command: string, args: Array<string>) {
    return new Promise<void>((res, rej) => {
      const proc = ChildProcess.spawn(command, args, {
        cwd: this.props.cwd,
        env: this.props.env,
        stdio: ["ignore", "pipe", "pipe"],
        shell: true,
      });

      proc.stdout.setEncoding("utf8");
      proc.stderr.setEncoding("utf8");

      proc.stdout.on("data", (d) => (this.#logs += d.toString()));
      proc.stderr.on("data", (d) => (this.#logs += d.toString()));

      proc.on("exit", (code) =>
        code === 0
          ? res()
          : rej(`Command ${this.Name} excited with code ${code}`)
      );
    });
  }

  protected run(code: string, shell: ValidShell): Promise<void> {
    switch (shell) {
      case "text/javascript":
        return this.#execute("node", ["-e", code]);
      case "text/python":
        return this.#execute("python", ["-c", code]);
      case "text/ruby":
        return this.#execute("node", ["-e", code]);
      case "shell/bash":
        return this.#execute("bash", ["-i", "-c", code]);
      case "shell/zsh":
        return this.#execute("zsh", ["-i", "-c", code]);
      case "shell/sh":
        return this.#execute("sh", ["-i", "-c", code]);
    }
  }

  get Logs() {
    return this.#logs;
  }

  abstract get Name(): string;
}
