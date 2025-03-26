import CLI from "clui";
import CLC from "cli-color";
import RunnerContext from "runner-context";

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

export default class UserInterface {
  #ctx: RunnerContext | undefined;
  #interval: NodeJS.Timeout | undefined;

  get #is_pipeline() {
    return process.env.PIPELINE === "true";
  }

  constructor() {
    if (!this.#is_pipeline) {
      console.clear();
      this.#interval = setInterval(() => this.#render(), 10);
    }
  }

  SetCtx(ctx: RunnerContext) {
    this.#ctx = ctx;
    if (this.#is_pipeline) {
      console.log(
        this.#ctx.Tasks.map(([task, start, end]) =>
          [task.FullName, this.#difference(start, end)].join(" - ")
        ).join(", ")
      );

      const script = this.#ctx.Scripts.findLast((v) => true);
      console.log(`Script ${script?.Name.trim().split("\n")[0]}`);
    }
    ``;
  }

  Done(error: boolean) {
    if (this.#interval) clearInterval(this.#interval);
    this.#render();
    if (error && this.#is_pipeline) {
      const script = this.#ctx?.Scripts.findLast((v) => true);
      console.log(script?.Logs);
    }
  }

  #difference(start: Date, end: Date | undefined) {
    const ms = (end ?? new Date()).getTime() - start.getTime();
    if (ms < second) return `${ms}ms`;
    else if (ms < minute) return `${(ms / second).toFixed(2)}s`;
    else if (ms < hour) return `${(ms / minute).toFixed(2)}m`;
    else if (ms < day) return `${(ms / hour).toFixed(2)}h`;
    else return `${(ms / day).toFixed(2)}d`;
  }

  #render() {
    if (this.#is_pipeline) return;
    if (!this.#ctx) return;
    const buffer = new CLI.LineBuffer({
      x: 0,
      y: 0,
      width: "console",
      height: "console",
    });

    const tasks = this.#ctx.Tasks.map(
      ([task, start, end]) =>
        [task.FullName, this.#difference(start, end)] as const
    );

    const script = this.#ctx.Scripts.findLast((v) => true);
    const log_lines_full = [
      `Script ${script?.Name.trim().split("\n")[0]}`,
      ...(script?.Logs.split("\n") ?? []),
    ];

    buffer.addLine(
      new CLI.Line()
        .column("Tasks", 30, [CLC.bold])
        .column("Logs", buffer.width() - 30, [CLC.bold])
    );

    const total = buffer.height() - 2;
    for (let i = 0; i < total; i++)
      buffer.addLine(
        new CLI.Line()
          .column(
            tasks[i] ? `${tasks[i][0]} - ${CLC.cyan(tasks[0][1])}` : "",
            30
          )
          .column(
            log_lines_full[log_lines_full.length - (1 + i)] ?? "",
            buffer.width() - 30
          )
      );

    buffer.output();
  }
}
