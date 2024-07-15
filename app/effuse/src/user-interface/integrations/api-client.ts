import { Assert, Checker } from "@ipheion/safe-type";

type RequestConfig<T> = {
  url: string;
  params?: Record<string, string>;
  headers?: Record<string, string>;
  expect?: Checker<T>;
} & (
  | {
      method: "GET";
      no_cache?: boolean;
    }
  | {
      method: "PUT" | "POST";
      body?: unknown;
      invalidates: Array<string | [string, Record<string, string>]>;
    }
  | {
      method: "DELETE";
      invalidates: Array<string | [string, Record<string, string>]>;
    }
);

export class ApiClient {
  readonly #base_url: string;

  constructor(base_url: string) {
    this.#base_url = base_url;
  }

  static #cache: Record<string, Promise<any>> = {};

  get #base() {
    if (this.#base_url.endsWith("/")) return this.#base_url;
    return this.#base_url + "/";
  }

  Url(url: string, parameters: Record<string, string> = {}) {
    const ps = { ...parameters };

    for (const key in ps)
      if (url.includes(":" + key)) {
        url = url.replace(":" + key, encodeURIComponent(ps[key]));
        delete ps[key];
      }

    const params = new URLSearchParams();

    for (const key in ps) params.set(key, ps[key]);

    const searchString = params.toString();
    if (searchString) return new URL(url + "?" + searchString, this.#base).href;

    return new URL(url, this.#base).href;
  }

  #create_error(message: string, data: Record<string, string>) {
    return new Error(
      [message, ...Object.keys(data).map((k) => `${k}: ${data[k]}`)].join("\n")
    );
  }

  async #raw_send<T>(url: string, config: RequestConfig<T>): Promise<T> {
    const response = await fetch(url, {
      method: config.method,
      headers: {
        ...config.headers,
        ...("body" in config
          ? {
              "Content-Type": "application/json",
            }
          : {}),
      },
      body: "body" in config ? JSON.stringify(config.body) : undefined,
    });

    if (!response.ok)
      throw this.#create_error("Fetch failed", {
        base: this.#base_url,
        url: config.url,
        method: config.method,
        status: response.status.toString(),
      });

    if ("invalidates" in config)
      for (const schema of config.invalidates)
        if (Array.isArray(schema)) this.Invalidate(schema[0], schema[1]);
        else this.Invalidate(schema);
    if (!config.expect) return {} as any;

    const data = await response.json();
    Assert(config.expect, data);

    return data;
  }

  async Send<T>(config: RequestConfig<T>): Promise<T> {
    const url = this.Url(config.url, config.params);

    if (config.method === "GET" && !config.no_cache) {
      ApiClient.#cache[url] =
        ApiClient.#cache[url] ?? this.#raw_send(url, config);

      return await ApiClient.#cache[url];
    }

    return await this.#raw_send(url, config);
  }

  Invalidate(schema: string, params?: Record<string, string>) {
    const url = this.Url(schema, params);
    if (!ApiClient.#cache[url]) return;
    delete ApiClient.#cache[url];
  }
}
