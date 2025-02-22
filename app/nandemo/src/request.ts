import { Assert, Checker } from "@ipheion/safe-type";
import { Request as ExpressRequest } from "express";

export default class Request {
  readonly #req: ExpressRequest;

  constructor(req: ExpressRequest) {
    this.#req = req;
  }

  Body<T>(expect: Checker<T>) {
    const data = this.#req.body;
    Assert(expect, data);
    return data;
  }

  Param(name: string): string | undefined {
    return this.#req.params[name];
  }
}
