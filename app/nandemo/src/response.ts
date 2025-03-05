import { Response as ExpressResponse } from "express";

export default abstract class Response {
  abstract Accept(res: ExpressResponse): void;
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

export class JsonResponse extends Response {
  readonly #status: number;
  readonly #body: any;

  constructor(status: number, body: any) {
    super();
    this.#status = status;
    this.#body = body;
  }

  Accept(res: ExpressResponse): void {
    res.setHeader("Content-Type", "application/json");
    res.status(this.#status);
    res.send(JSON.stringify(this.#body));
  }
}

export class EmptyResponse extends Response {
  readonly #status: number;

  constructor(status: number) {
    super();
    this.#status = status;
  }

  Accept(res: ExpressResponse): void {
    res.status(this.#status);
    res.send();
  }
}

export class TextResponse extends Response {
  readonly #status: number;
  readonly #text: string;
  readonly #mime: string;

  constructor(status: number, text: string, mime: string) {
    super();
    this.#status = status;
    this.#text = text;
    this.#mime = mime;
  }

  Accept(res: ExpressResponse): void {
    res.status(this.#status);
    res.setHeader("Content-Type", this.#mime);
    res.send(this.#text);
  }
}

export class FileResponse extends Response {
  readonly #path: string;
  readonly #mime?: string;

  constructor(path: string, mime?: string) {
    super();
    this.#path = path;
    this.#mime = mime;
  }

  Accept(res: ExpressResponse): void {
    res.sendFile(this.#path, {
      headers: this.#mime
        ? {
            "Content-Type": this.#mime,
          }
        : undefined,
    });
  }
}
