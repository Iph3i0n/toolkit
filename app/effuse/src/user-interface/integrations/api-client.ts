import { Assert, Checker } from "@ipheion/safe-type";

type RequestConfig<T> = {
  method: "GET" | "PUT" | "POST" | "DELETE";
  url: string;
  params?: Record<string, string>;
  body?: unknown;
  headers?: Record<string, string>;
  expect: Checker<T>;
};

export class ApiClient {
  readonly #base_url: string;

  constructor(base_url: string) {
    this.#base_url = base_url;
  }

  get #base() {
    if (this.#base_url.endsWith("/")) return this.#base_url;
    return this.#base_url + "/";
  }

  #url(url: string, parameters: Record<string, string> = {}) {
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

  async Send<T>(config: RequestConfig<T>) {
    const response = await fetch(this.#url(config.url, config.params), {
      method: config.method,
      headers: {
        ...config.headers,
        ...(config.body
          ? {
              "Content-Type": "application/json",
            }
          : {}),
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    if (!response.ok)
      throw this.#create_error("Fetch failed", {
        base: this.#base_url,
        url: config.url,
        method: config.method,
        status: response.status.toString(),
      });

    const data = await response.json();
    Assert(config.expect, data);

    return data;
  }
}
