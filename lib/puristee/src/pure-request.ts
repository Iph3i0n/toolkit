import type { IncomingMessage } from "node:http";
import Pattern from "./pattern";
import { ReadonlyRecord } from "./util-types";
import Cookies from "./cookies";
import { Checker } from "@ipheion/safe-type";

async function GetJson(request: IncomingMessage) {
  return new Promise<unknown>((res) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      try {
        res(JSON.parse(body));
      } catch {
        res(undefined);
      }
    });

    request.on("error", () => {
      res(undefined);
    });
  });
}

function IsDictionaryMatch<
  T extends Record<string, string | Array<string> | null | undefined>
>(
  checker: { [TKey in keyof T]: Checker<T[TKey]> },
  // deno-lint-ignore no-explicit-any
  subject: any
): subject is T {
  if (typeof subject !== "object") return false;
  for (const key in checker) if (!checker[key](subject[key])) return false;

  return true;
}

export default class PureRequest {
  private readonly url_object: URL;

  private constructor(
    private readonly request: IncomingMessage,
    private readonly pattern: Pattern,
    private readonly body_data: unknown
  ) {
    this.url_object = new URL(
      request.url ?? "/",
      `http://${request.headers.host}`
    );
  }

  public get url() {
    return this.url_object.pathname;
  }

  public get method() {
    return this.request.method;
  }

  public get headers() {
    let result: ReadonlyRecord<string, string> = {};
    for (const [key, value] of Object.entries(this.request.headers))
      result = Object.assign(result, {
        get [key]() {
          return value;
        },
      });

    return result;
  }

  public get parameters() {
    return this.pattern.Parameters(this.url_object);
  }

  public get body() {
    return this.body_data;
  }

  public get cookies() {
    return Cookies(this.request);
  }

  Body<T>(checker: Checker<T>) {
    let body = this.body;
    if (body instanceof FormData) {
      // deno-lint-ignore no-explicit-any
      const result: any = {};
      for (const [key, value] of body.entries()) result[key] = value.valueOf();
      body = result;
    }

    if (checker(body)) return body;
    return undefined;
  }

  Parameters<
    T extends Record<string, string | Array<string> | null | undefined>
  >(checker: { [TKey in keyof T]: Checker<T[TKey]> }) {
    const parameters = this.parameters;
    if (IsDictionaryMatch(checker, parameters)) return parameters;
    return undefined;
  }

  public static async Init(request: IncomingMessage, pattern: Pattern) {
    const body = await GetJson(request);

    return new PureRequest(request, pattern, body);
  }
}
