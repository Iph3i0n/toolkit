import Axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  CreateAxiosDefaults,
} from "axios";

export class ClientBase {
  readonly #axios: AxiosInstance;

  constructor(config: CreateAxiosDefaults) {
    this.#axios = Axios.create(config);
  }

  #create_error(message: string, data: Record<string, string>) {
    return new Error(
      [message, ...Object.keys(data).map((k) => `${k}: ${data[k]}`)].join("\n")
    );
  }

  async get(url: string, config?: AxiosRequestConfig) {
    try {
      return await this.#axios.get(url, config);
    } catch (e: any) {
      const err: AxiosError = e;

      throw this.#create_error("Axios Request Failed", {
        url,
        method: "Get",
        status: err.response?.status.toString() ?? "",
      });
    }
  }

  async options(url: string, config?: AxiosRequestConfig) {
    try {
      return await this.#axios.options(url, config);
    } catch (e: any) {
      const err: AxiosError = e;

      throw this.#create_error("Axios Request Failed", {
        url,
        method: "Options",
        status: err.response?.status.toString() ?? "",
      });
    }
  }

  async put(url: string, body: unknown, config?: AxiosRequestConfig) {
    try {
      return await this.#axios.put(url, body, config);
    } catch (e: any) {
      const err: AxiosError = e;

      throw this.#create_error("Axios Request Failed", {
        url,
        method: "Put",
        status: err.response?.status.toString() ?? "",
      });
    }
  }

  async post(url: string, body: unknown, config?: AxiosRequestConfig) {
    try {
      return await this.#axios.post(url, body, config);
    } catch (e: any) {
      const err: AxiosError = e;

      throw this.#create_error("Axios Request Failed", {
        url,
        method: "Post",
        status: err.response?.status.toString() ?? "",
      });
    }
  }
}
