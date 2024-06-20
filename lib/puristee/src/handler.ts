import { Schema, StateReader, StateWriter } from "@ipheion/fs-db";
import PureRequest from "./pure-request";
import { IResponse } from "./response";

export type Promisish<T> = T | Promise<T>;

export type ServerResponse<TState extends Schema> =
  | {
      state?: StateWriter<TState>;
      response: IResponse;
    }
  | IResponse;

export abstract class Handler<TState extends Schema> {
  abstract Process(
    request: PureRequest,
    state: StateReader<TState>
  ): Promisish<ServerResponse<TState>>;
}

export type HandlerFactory<TState extends Schema> = new () => Handler<TState>;
