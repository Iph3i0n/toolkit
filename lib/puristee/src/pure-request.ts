import type { IncomingMessage } from "node:http";
import Pattern from "./pattern";
import { ReadonlyRecord } from "./util-types";
import Cookies from "./cookies";

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

  public static async Init(request: IncomingMessage, pattern: Pattern) {
    const body = await GetJson(request);

    return new PureRequest(request, pattern, body);
  }
}
