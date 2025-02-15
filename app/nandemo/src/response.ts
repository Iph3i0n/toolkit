import { Response as ExpressResponse } from "express";

export default abstract class Response {
  abstract Accept(res: ExpressResponse): void;
}

export class FileResponse extends Response {
  readonly #path: string;

  constructor(path: string) {
    super();
    this.#path = path;
  }

  Accept(res: ExpressResponse): void {
    res.sendFile(this.#path);
  }
}

export class RedirectResponse extends Response {
  readonly #status: number;
  readonly #location: string;

  constructor(status: number, location: string) {
    super();
    this.#status = status;
    this.#location = location;
  }

  Accept(res: ExpressResponse): void {
    res.setHeader("Location", this.#location);
    res.status(this.#status);
    res.send();
  }
}
