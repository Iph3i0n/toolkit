import Http from "node:http";
import Stream from "node:stream";
import { WebSocket, WebSocketServer as WsServer } from "ws";
import { v4 as Guid } from "uuid";
import { ThreadPool } from "./thread-pool";

export class WebSocketServer {
  readonly #wss = new WsServer({ noServer: true });
  readonly #connections: Record<string, WebSocket> = {};
  readonly #thread_pool: ThreadPool;

  constructor(thread_pool: ThreadPool, server: Http.Server) {
    this.#thread_pool = thread_pool;

    server.on("upgrade", async (request, socket, head) =>
      this.Upgrade(request, socket, head)
    );
  }

  async Upgrade(
    request: Http.IncomingMessage,
    socket: Stream.Duplex,
    head: Buffer
  ) {
    const request_id = Guid();
    const url = new URL(request.url ?? "/", `http://localhost:3000`);

    const response = await this.#thread_pool.Run({
      request_id: "WS_CONNECT_" + request_id,
      event: "WEBSOCKET_CONNECT",
      url: url.href,
      method: "GET",
      headers: {},
      body: undefined,
    });

    if (response.status > 399) return socket.destroy();

    this.#wss.handleUpgrade(request, socket, head, (ws) => {
      this.#connections[request_id] = ws;
      const url = new URL(ws.url ?? "/", `http://localhost:3000`);

      ws.on("error", console.error);

      if (response.ws_events?.message)
        ws.on("message", async (data) => {
          const response = await this.#thread_pool.Run({
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

      if (response.ws_events?.close)
        ws.on("close", () => {
          this.#thread_pool.Run({
            request_id: "WS_CLOSE_" + request_id,
            event: "WEBSOCKET_MESSAGE",
            url: url.href,
            method: "GET",
            headers: {},
            body: undefined,
          });
        });
    });
  }

  Send(connection_id: string, data: string) {
    const connection = this.#connections[connection_id];
    if (!connection)
      return console.error("Connection ID not found " + connection_id);
    connection.send(data);
  }
}
