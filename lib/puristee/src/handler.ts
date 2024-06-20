import { Schema, StateReader, StateWriter } from "@ipheion/fs-db";
import PureRequest from "./pure-request";
import { IResponse } from "./response";

export type Promisish<T> = T | Promise<T>;

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

export class Result<TState extends Schema> {
  readonly #state?: StateWriter<TState>;
  readonly #response: IResponse;

  constructor(response: IResponse, state?: StateWriter<TState>) {
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

export abstract class Handler<TState extends Schema> {
  readonly #state: StateReader<TState>;

  constructor(state: StateReader<TState>) {
    this.#state = state;
  }

  get State() {
    return this.#state;
  }

  abstract Process(request: PureRequest): Promisish<Result<TState>>;

  abstract readonly Url: string;

  abstract readonly Method: HttpMethod;
}

export type HandlerFactory<TState extends Schema> = new (
  state: StateReader<TState>
) => Handler<TState>;
