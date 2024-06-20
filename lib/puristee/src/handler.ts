import { Schema, StateReader, StateWriter } from "@ipheion/fs-db";
import PureRequest from "./pure-request";
import { IResponse } from "./response";

export type Promisish<T> = T | Promise<T>;

export class ServerResponse<TState extends Schema> {
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
  abstract Process(
    request: PureRequest,
    state: StateReader<TState>
  ): Promisish<ServerResponse<TState>>;
}

export type HandlerFactory<TState extends Schema> = new () => Handler<TState>;
