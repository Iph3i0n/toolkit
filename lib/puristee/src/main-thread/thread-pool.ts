import { Worker, SHARE_ENV } from "node:worker_threads";
import Path from "node:path";
import {
  InternalRequest,
  InternalResponse,
  Startup,
  WebSocketPost,
} from "../contracts";
import { HandlerDirectory } from "./handler-directory";

export class ThreadPool {
  readonly #threads: Array<Worker> = [];
  readonly #listeners: Record<string, (res: InternalResponse) => void> = {};
  #thread_number = 0;

  constructor(
    count: number,
    handlers: HandlerDirectory,
    on_websocket: (connection_id: string, data: string) => void
  ) {
    for (let i = 0; i < count; i++) {
      const thread = this.#start_worker({
        handlers: handlers.Handlers,
        log_init: i === 0,
      });
      this.#threads.push(thread);

      thread.on("message", (data: InternalResponse) => {
        if (InternalResponse(data)) {
          const listener = this.#listeners[data.request_id];
          if (!listener)
            throw new Error("Got a response when there is no listener");

          listener(data);
        }

        if (WebSocketPost(data)) {
          on_websocket(data.connection_id, data.data);
        }
      });
    }
  }

  #start_worker(data: Startup) {
    return new Worker(Path.resolve(__dirname, "../worker-thread/worker.js"), {
      workerData: data,
      env: SHARE_ENV,
    });
  }

  Run(data: InternalRequest) {
    this.#thread_number = (this.#thread_number + 1) % this.#threads.length;
    const target_thread = this.#thread_number;

    return new Promise<InternalResponse>((res) => {
      this.#listeners[data.request_id] = (data) => {
        delete this.#listeners[data.request_id];
        res(data);
      };
      this.#threads[target_thread].postMessage(data);
    });
  }
}
