import Http from "node:http";
import Send from "./response-applier";
import Fs from "node:fs/promises";
import Path from "node:path";
import { Worker, SHARE_ENV } from "node:worker_threads";
import Multipart from "parse-multipart-data";
import { InternalRequest, InternalResponse, Startup } from "./contracts";
import { v4 as Guid } from "uuid";
import { Assert } from "@ipheion/safe-type";

async function GetJson(request: Http.IncomingMessage) {
  return new Promise<unknown>((res) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      const content_type = request.headers["content-type"];
      try {
        if (content_type?.includes("application/json")) res(JSON.parse(body));
        else if (content_type?.includes("multipart/form-data")) {
          const [boundary] = body.split("\n");
          res(Multipart.parse(Buffer.from(body), boundary));
        }
      } catch {
        res(undefined);
      }
    });

    request.on("error", () => {
      res(undefined);
    });
  });
}

function GetHeaders(request: Http.IncomingMessage) {
  let result: Record<string, string> = {};
  for (const [key, value] of Object.entries(request.headers))
    if (typeof value === "string") result[key] = value;

  return result;
}

function StartWorker(data: Startup) {
  return new Worker(Path.resolve(__dirname, "worker.js"), {
    workerData: data,
    env: SHARE_ENV,
  });
}

type StartOptions = {
  handler_dir: string;
  port: number;
  threads: number;
};

export async function StartServer(options: StartOptions) {
  const handlers: Record<string, string> = {};
  for (const item of await Fs.readdir(options.handler_dir)) {
    if (!item.endsWith(".js")) continue;
    const loc = Path.resolve(options.handler_dir, item);
    handlers[Guid()] = loc;
  }

  const listeners: Record<string, (res: InternalResponse) => void> = {};
  const threads: Array<Worker> = [];
  for (let i = 0; i < options.threads; i++) {
    const thread = StartWorker({
      handlers,
      log_init: i === 0,
    });
    threads.push(thread);

    thread.on("message", (data: InternalResponse) => {
      Assert(InternalResponse, data);

      const listener = listeners[data.request_id];
      if (!listener)
        throw new Error("Got a response when there is no listener");

      listener(data);
    });
  }

  let thread_number = 0;
  const Run = async (
    request: Http.IncomingMessage
  ): Promise<InternalResponse> => {
    thread_number = (thread_number + 1) % threads.length;
    const target_thread = thread_number;

    const request_id = Guid();
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

      console.log(`Handling request for ${request.url}`);
      const data: InternalRequest = {
        request_id,
        url: url.href,
        method: request.method ?? "GET",
        headers: GetHeaders(request),
        body: await GetJson(request),
      };

      return await new Promise<InternalResponse>((res) => {
        listeners[request_id] = res;
        threads[target_thread].postMessage(data);
      });
    } catch (err) {
      console.error(err);
      return {
        request_id,
        status: 500,
        body: { Error: "Internal Server Error" },
        headers: {},
        cookies: {},
      };
    }
  };

  const server = Http.createServer(async (req, res) => {
    const response = await Run(req);
    await Send(response, res);
  });

  server.listen(options.port, () =>
    console.log(`Server listening on ${options.port}`)
  );
}
