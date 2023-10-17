import { Assert, IsObject, IsString } from "@ipheion/safe-type";

type RequestProps = {
  method: string;
  url: string | Array<string>;
  query?: Record<string, string> | undefined;
  data?: unknown;
  headers?: Record<string, string>;
  base_url?: string;
};

export class ApiClient {
  static #token: string | undefined;

  static IdentityBaseUrl = "http://localhost:3000/";

  #build_url(url: string | Array<string>) {
    if (typeof url === "string") return url;

    return url.reduce((c, n) => {
      if (c.endsWith("/")) c = c.substring(0, c.length - 1);
      if (n.startsWith("/")) n = n.substring(1);

      return c + "/" + encodeURI(n);
    }, "");
  }

  async #request(props: RequestProps) {
    const url_object = new URL(this.#build_url(props.url), props.base_url);
    if (props.query)
      url_object.search = new URLSearchParams(props.query).toString();
    const final_headers = { ...(props.headers ?? {}) };
    if (ApiClient.#token)
      final_headers.Authorization = `Token ${ApiClient.#token}`;

    if (typeof props.data !== "string")
      final_headers["Content-Type"] = "application/json";

    const response = await fetch(url_object.toString(), {
      method: props.method,
      headers: final_headers,
      body:
        typeof props.data === "string"
          ? props.data
          : JSON.stringify(props.data),
    });

    let body: unknown;
    try {
      body = await response.json();
    } catch {
      body = await response.text();
    }

    return {
      status: response.status,
      headers: response.headers,
      body,
      ok: response.ok,
    };
  }

  static async Login(email: string, password: string) {
    const client = new ApiClient();
    const response = await client.#request({
      method: "get",
      url: "/api/v1/token",
      query: { email, password },
      base_url: this.IdentityBaseUrl,
    });

    if (response.status === 407) return "invalid" as const;

    if (response.status !== 200) return "failed" as const;

    Assert(IsObject({ token: IsString }), response.body);
    this.#token = response.body.token;
    return "success" as const;
  }

  static async Register(email: string, name: string, password: string) {
    const client = new ApiClient();
    const response = await client.#request({
      method: "post",
      url: "/api/v1/users",
      data: { email, name, password },
      base_url: this.IdentityBaseUrl,
    });

    if (response.status === 409) return "conflict" as const;

    if (response.status !== 200) return "failed" as const;

    Assert(IsObject({ token: IsString }), response.body);
    this.#token = response.body.token;
    return "success" as const;
  }

  static async Profile() {
    if (!this.#token)
      throw new Error("Cannot fetch profile when not logged in");
    const client = new ApiClient();
    const response = await client.#request({
      method: "get",
      url: ["/api/v1/token/", this.#token],
      base_url: this.IdentityBaseUrl,
    });

    if (response.status === 407) return "unauthorised" as const;

    if (response.status !== 200) return "failed" as const;

    Assert(
      IsObject({ id: IsString, email: IsString, last_login: IsString }),
      response.body
    );

    return response.body;
  }

  static async UpdatePassword(old_password: string, password: string) {
    const client = new ApiClient();
    const identity = await this.Profile();
    if (typeof identity === "string") throw identity;

    const response = await client.#request({
      method: "get",
      url: ["/api/v1/users", identity.id, "password"],
      query: { old_password, password },
      base_url: this.IdentityBaseUrl,
    });

    if (response.status === 407) return "invalid" as const;

    if (response.status !== 200) return "failed" as const;

    Assert(IsObject({ token: IsString }), response.body);
    this.#token = response.body.token;
    return "success" as const;
  }

  static async UpdateEmail(email: string, password: string) {
    const client = new ApiClient();
    const identity = await this.Profile();
    if (typeof identity === "string") throw identity;

    const response = await client.#request({
      method: "get",
      url: ["/api/v1/users", identity.id, "email"],
      query: { email, password },
      base_url: this.IdentityBaseUrl,
    });

    if (response.status === 407) return "invalid" as const;

    if (response.status !== 200) return "failed" as const;

    Assert(IsObject({ token: IsString }), response.body);
    this.#token = response.body.token;
    return "success" as const;
  }
}
