import { parentPort } from "node:worker_threads";
import { Directory, Schema, StateWriter } from "@ipheion/fs-db";
import Pattern from "./pattern";
import PureRequest from "./pure-request";
import { IResponse } from "./response";
import { IHandler, InternalRequest, InternalResponse } from "../contracts";

export const HttpMethod = Object.freeze({
  Get: "GET",
  Put: "PUT",
  Post: "POST",
  Delete: "DELETE",
  Patch: "PATCH",
  Options: "OPTIONS",
  Head: "HEAD",
  Connect: "CONNECT",
  Trace: "TRACE",
});

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

export type Promisish<T> = T | Promise<T>;

export default function CreateServer<TSchema extends Schema>(
  state_dir: string,
  schema: TSchema,
  default_headers?: Record<string, string>
) {
  const state_manager = new Directory(schema, state_dir);

  class Result {
    readonly #state?: StateWriter<TSchema>;
    readonly #response: IResponse;

    constructor(response: IResponse, state?: StateWriter<TSchema>) {
      this.#response = response;
      this.#state = state;
    }

    get state() {
      return this.#state;
    }

    get response() {
      return this.#response;
    }
  }

  abstract class Handler implements IHandler {
    get type() {
      return "REST" as const;
    }

    get Pattern() {
      return new Pattern(this.Url);
    }

    get State() {
      return state_manager.Model;
    }

    abstract Process(request: PureRequest): Promisish<Result | IResponse>;

    abstract readonly Url: string;

    abstract readonly Method: HttpMethod;

    async OnRequest(request: InternalRequest): Promise<InternalResponse> {
      try {
        console.log(
          `Handling ${request.request_id} with ${request.method}:${this.Pattern.Route}`
        );
        const request_object = new PureRequest(request, this.Pattern);
        const result = await this.Process(request_object);
        const state = result instanceof Result ? result.state : undefined;
        const response = result instanceof Result ? result.response : result;

        if (state) state_manager.Write(state);
        const body = await response.body;
        const status = await response.status;
        return {
          request_id: request.request_id,
          status,
          headers: {
            ...default_headers,
            ...response.headers,
          },
          body,
          cookies: response.cookies,
        };
      } catch (err: any) {
        if ("status" in err)
          return {
            request_id: request.request_id,
            status: await err.status,
            body: await err.body,
            headers: {
              ...default_headers,
              ...err.headers,
            },
            cookies: err.cookies,
          };
        console.error(err);
        return {
          request_id: request.request_id,
          status: 500,
          body: { Error: "Internal Server Error" },
          headers: {
            ...default_headers,
          },
          cookies: {},
        };
      }
    }
  }

  abstract class WebSocketHandler implements IHandler {
    get type() {
      return "WEBSOCKET" as const;
    }

    get Pattern() {
      return new Pattern(this.Url);
    }

    get State() {
      return state_manager.Model;
    }

    abstract readonly Url: string;

    get Method(): HttpMethod {
      return HttpMethod.Get;
    }

    abstract OnConnect(request: PureRequest): Promisish<Result | IResponse>;
    abstract OnMessage(request: PureRequest): Promisish<Result | IResponse>;
    abstract OnClose(request: PureRequest): Promisish<Result | IResponse>;

    async OnRequest(request: InternalRequest): Promise<InternalResponse> {
      try {
        console.log(`Handling ${request.event} for ${request.url}`);
        const request_object = new PureRequest(request, this.Pattern);
        const result =
          request.event === "WEBSOCKET_CONNECT"
            ? await this.OnConnect(request_object)
            : request.event === "WEBSOCKET_MESSAGE"
            ? await this.OnMessage(request_object)
            : request.event === "WEBSOCKET_DISCONNECT"
            ? await this.OnClose(request_object)
            : undefined;

        if (!result)
          return {
            request_id: request.request_id,
            status: 404,
            body: { Error: "Not Found" },
            headers: {
              ...default_headers,
            },
            cookies: {},
          };

        const state = result instanceof Result ? result.state : undefined;
        const response = result instanceof Result ? result.response : result;
        if (state) state_manager.Write(state);
        return {
          request_id: request.request_id,
          status: await response.status,
          headers: {
            ...default_headers,
            ...response.headers,
          },
          body: response.body,
          cookies: response.cookies,
          ws_events: { message: "OnMessage" in this, close: "OnClose" in this },
        };
      } catch (err: any) {
        if ("status" in err)
          return {
            request_id: request.request_id,
            status: await err.status,
            body: await err.body,
            headers: {
              ...default_headers,
              ...err.headers,
            },
            cookies: err.cookies,
          };
        console.error(err);
        return {
          request_id: request.request_id,
          status: 500,
          body: { Error: "Internal Server Error" },
          headers: {
            ...default_headers,
          },
          cookies: {},
        };
      }
    }
  }

  return {
    Handler,
    Response: Result,
    WebSocketHandler,
    SendWebsocketMessage(connection_id: string, data: any) {
      parentPort?.postMessage({
        type: "WS_POST",
        connection_id,
        data: JSON.stringify(data),
      });
    },
  };
}
