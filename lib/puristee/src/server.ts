import { Directory, Schema, StateWriter } from "@ipheion/fs-db";
import Pattern from "./pattern";
import PureRequest from "./pure-request";
import { IResponse } from "./response";
import { IHandler, InternalRequest, InternalResponse } from "./contracts";

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
    get Pattern() {
      return new Pattern(this.Url);
    }

    get State() {
      return state_manager.Model;
    }

    abstract Process(request: PureRequest): Promisish<Result>;

    abstract readonly Url: string;

    abstract readonly Method: HttpMethod;

    async OnRequest(request: InternalRequest): Promise<InternalResponse> {
      try {
        console.log(`Handling request for ${request.url}`);
        const request_object = new PureRequest(request, this.Pattern);
        const result = await this.Process(request_object);

        if (result.state) state_manager.Write(result.state);
        return {
          request_id: request.request_id,
          status: await result.response.status,
          headers: {
            ...default_headers,
            ...result.response.headers,
          },
          body: result.response.body,
          cookies: result.response.cookies,
        };
      } catch (err) {
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
    Handler: Handler,
    Response: Result,
  };
}
