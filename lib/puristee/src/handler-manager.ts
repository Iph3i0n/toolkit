import Http from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import Send from "./response-applier";
import Fs from "node:fs/promises";
import Path from "node:path";
import { Worker, SHARE_ENV } from "node:worker_threads";
import Multipart from "parse-multipart-data";
import {
  InternalRequest,
  InternalResponse,
  Startup,
  WebSocketPost,
} from "./contracts";
import { v4 as Guid } from "uuid";

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
      if (!InternalResponse(data)) return;

      const listener = listeners[data.request_id];
      if (!listener)
        throw new Error("Got a response when there is no listener");

      listener(data);
    });
  }

  let thread_number = 0;
  const Message = async (data: InternalRequest) => {
    thread_number = (thread_number + 1) % threads.length;
    const target_thread = thread_number;

    return await new Promise<InternalResponse>((res) => {
      listeners[data.request_id] = (data) => {
        delete listeners[data.request_id];
        res(data);
      };
      threads[target_thread].postMessage(data);
    });
  };

  const Run = async (
    request: Http.IncomingMessage
  ): Promise<InternalResponse> => {
    const request_id = Guid();
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

      console.log(`Handling request for ${request.url}`);
      const data: InternalRequest = {
        request_id,
        event: "REST",
        url: url.href,
        method: request.method ?? "GET",
        headers: GetHeaders(request),
        body: await GetJson(request),
      };

      return await Message(data);
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

  const wss = new WebSocketServer({ server });

  const connections: Record<string, WebSocket> = {};
  wss.on("connection", async (ws) => {
    const request_id = Guid();
    connections[request_id] = ws;
    const url = new URL(ws.url ?? "/", `http://localhost:3000`);

    const response = await Message({
      request_id: "WS_CONNECT_" + request_id,
      event: "WEBSOCKET_CONNECT",
      url: url.href,
      method: "GET",
      headers: {},
      body: undefined,
    });

    if (response.status > 399) return ws.close();

    ws.send(JSON.stringify(response));

    ws.on("error", console.error);

    ws.on("message", async (data) => {
      const response = await Message({
        request_id: "WS_MESSAGE_" + request_id,
        event: "WEBSOCKET_MESSAGE",
        url: url.href,
        method: "GET",
        headers: {},
        body: JSON.parse(data.toString()),
      });

      if (response.status > 399) return ws.close();

      ws.send(JSON.stringify(response));
    });

    ws.on("close", () => {
      Message({
        request_id: "WS_CLOSE_" + request_id,
        event: "WEBSOCKET_MESSAGE",
        url: url.href,
        method: "GET",
        headers: {},
        body: undefined,
      });
    });
  });

  for (const thread of threads)
    thread.on("message", (data) => {
      if (!WebSocketPost(data)) return;
      const connection = connections[data.connection_id];
      if (!connection)
        return console.error("Connection ID not found " + data.connection_id);

      connection.send(data.data as Buffer);
    });

  server.listen(options.port, () =>
    console.log(`Server listening on ${options.port}`)
  );
}
