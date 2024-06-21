import { SetCookie } from "./set-cookies";
import { ReadonlyRecord } from "./util-types";
import Mime from "mime-types";
import Fs from "node:fs/promises";

export interface IResponse {
  readonly status: number | Promise<number>;
  readonly headers: ReadonlyRecord<string, string>;
  readonly cookies: Record<string, SetCookie>;
  readonly body: unknown | Promise<unknown>;
}

const StatusCodes = Object.freeze({
  /**
   * Request Successful
   */
  Ok: 200,
  Created: 201,
  MultipleChoices: 300,
  /**
   * GET methods unchanged. Others may or may not be changed to GET.
   * Reorganization of a website.
   */
  MovedPermanently: 301,
  /**
   * GET methods unchanged. Others may or may not be changed to GET.
   * The Web page is temporarily unavailable for unforeseen reasons.
   */
  Found: 302,
  /**
   * GET methods unchanged. Others changed to GET (body lost).
   * Used to redirect after a PUT or a POST, so that refreshing the result page doesn't re-trigger the operation.
   */
  SeeOther: 303,
  /**
   * Sent for revalidated conditional requests. Indicates that the cached response is still fresh and can be used.
   */
  NotModified: 304,
  /**
   * Method and body not changed.
   * The Web page is temporarily unavailable for unforeseen reasons. Better than 302 when non-GET operations are available on the site.
   */
  TemporaryRedirect: 307,
  /**
   * Method and body not changed.
   * Reorganization of a website, with non-GET links/operations.
   */
  PermanentRedirect: 308,

  /**
   * Body or parameters are of invalid schema.
   */
  BadRequest: 400,
  Unauthorised: 403,
  /**
   * No resource exists.
   */
  NotFound: 404,
  Conflict: 409,
  InternalServerError: 500,
});

type Status = keyof typeof StatusCodes;

export class JsonResponse implements IResponse {
  readonly #status: Status;
  readonly #headers?: ReadonlyRecord<string, string>;
  readonly #cookies?: Record<string, SetCookie>;
  readonly #body: unknown;

  constructor(
    status: Status,
    body: unknown,
    headers?: ReadonlyRecord<string, string>,
    cookies?: Record<string, SetCookie>
  ) {
    this.#status = status;
    this.#body = body;
    this.#headers = headers;
    this.#cookies = cookies;
  }

  get status() {
    return StatusCodes[this.#status];
  }

  get headers() {
    return this.#headers ?? {};
  }

  get cookies() {
    return this.#cookies ?? {};
  }

  get body() {
    return this.#body;
  }
}

export class EmptyResponse implements IResponse {
  readonly #status: Status;

  constructor(status: Status) {
    this.#status = status;
  }

  get status() {
    return StatusCodes[this.#status];
  }

  get headers() {
    return {};
  }

  get cookies() {
    return {};
  }

  get body() {
    return "";
  }
}

export class RedirectRepsonse implements IResponse {
  readonly #status: Status;
  readonly #to: string;

  constructor(status: Status, to: string) {
    this.#status = status;
    this.#to = to;
  }

  get status() {
    return StatusCodes[this.#status];
  }

  get headers() {
    return {
      Location: this.#to,
    };
  }

  get cookies() {
    return {};
  }

  get body() {
    return "";
  }
}

function GetMime(path: string) {
  const extension = path.split(".").findLast(() => true);

  return Mime.lookup(extension ?? "");
}

export class FileResponse implements IResponse {
  readonly #path: string;
  readonly #mime?: string;

  constructor(path: string, mime?: string) {
    this.#path = path;
    this.#mime = mime;
  }

  get status() {
    return new Promise<number>(async (res) => {
      try {
        const stat = await Fs.stat(this.#path);
        if (stat.isDirectory()) return res(404);
        res(200);
      } catch (err) {
        res(404);
      }
    });
  }

  get headers() {
    return {
      "Content-Type": (this.#mime ?? GetMime(this.#path)) || "",
    };
  }

  get cookies() {
    return {};
  }

  get body() {
    return new Promise<Buffer | undefined>(async (res) => {
      try {
        return await Fs.readFile(this.#path);
      } catch {
        res(undefined);
      }
    });
  }
}

export class MemoryFileResponse implements IResponse {
  readonly #data: Buffer;
  readonly #mime: string;

  constructor(data: Buffer, mime: string) {
    this.#data = data;
    this.#mime = mime;
  }

  get status() {
    return 200;
  }

  get headers() {
    return {
      "Content-Type": this.#mime,
    };
  }

  get cookies() {
    return {};
  }

  get body() {
    return this.#data;
  }
}
