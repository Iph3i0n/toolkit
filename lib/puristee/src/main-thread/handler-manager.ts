import Http from "node:http";
import Send from "./response-applier";
import Multipart from "parse-multipart-data";
import { InternalRequest, InternalResponse, Startup } from "../contracts";
import { v4 as Guid } from "uuid";
import { ThreadPool } from "./thread-pool";
import { HandlerDirectory } from "./handler-directory";
import { WebSocketServer } from "./websocket-server";

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

type StartOptions = {
  handler_dir: string;
  port: number;
  threads: number;
};

export async function StartServer(options: StartOptions) {
  let wss: WebSocketServer;

  const thread_pool = new ThreadPool(
    options.threads,
    new HandlerDirectory(options.handler_dir),
    (conn, data) => wss.Send(conn, data)
  );

  wss = new WebSocketServer(thread_pool);

  const Run = async (
    request: Http.IncomingMessage
  ): Promise<InternalResponse> => {
    const request_id = Guid();
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host}`);

      console.log(`Handling request for ${request.method}:${request.url}`);
      const data: InternalRequest = {
        request_id,
        event: "REST",
        url: url.href,
        method: request.method ?? "GET",
        headers: GetHeaders(request),
        body: await GetJson(request),
      };

      return await thread_pool.Run(data);
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

  server.on("upgrade", async (request, socket, head) =>
    wss.Upgrade(request, socket, head)
  );

  server.listen(options.port, () =>
    console.log(`Server listening on ${options.port}`)
  );
}
