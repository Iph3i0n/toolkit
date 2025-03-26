import Http from "node:http";
import Multipart from "parse-multipart-data";
import { InternalRequest, InternalResponse } from "../contracts";
import { v4 as Guid } from "uuid";
import { ThreadPool } from "./thread-pool";
import { HandlerDirectory } from "./handler-directory";
import { WebSocketServer } from "./websocket-server";
import SetCookies from "./set-cookies";
import { IsString } from "@ipheion/safe-type";

const AcceptedTypes = [
  Blob,
  ArrayBuffer,
  FormData,
  URLSearchParams,
  Uint8Array,
];

async function GetData(request: Http.IncomingMessage) {
  return new Promise<string | undefined>((res) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      res(body);
    });

    request.on("error", () => {
      res(undefined);
    });
  });
}

async function GetBody(request: Http.IncomingMessage) {
  const content_type = request.headers["content-type"];
  if (content_type?.includes("application/json"))
    return JSON.parse((await GetData(request)) ?? "{}");
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

  const Run = async (
    request: Http.IncomingMessage
  ): Promise<InternalResponse> => {
    const request_id = Guid();
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
      console.log("Recieved request " + url.href);

      const data: InternalRequest = {
        request_id,
        event: "REST",
        url: url.href,
        method: request.method ?? "GET",
        headers: GetHeaders(request),
        body: await GetBody(request),
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

  const server = Http.createServer();

  wss = new WebSocketServer(thread_pool, server);

  server.on("request", async (req, res) => {
    try {
      const response = await Run(req);
      const headers = response.headers ?? {};
      for (const key in headers) res = res.setHeader(key, headers[key]);

      if (response.cookies)
        for (const value of SetCookies(response.cookies))
          res = res.setHeader("Set-Cookie", value);

      const original_body = response.body;
      for (const type of AcceptedTypes)
        if (original_body instanceof type) {
          res.statusCode = response.status;
          res.write(original_body);
          return res.end();
        }

      if (IsString(original_body)) {
        res.statusCode = response.status;
        res.write(original_body);
        return res.end();
      }

      res = res.setHeader("Content-Type", "application/json");
      res.statusCode = response.status;
      res.write(JSON.stringify(original_body));
      return res.end();
    } catch (err) {
      console.error(err);
      res.statusCode = 500;
      res.write("Internal Server Error");
      return res.end();
    }
  });

  server.listen(options.port, () =>
    console.log(`Server listening on ${options.port}`)
  );
}
