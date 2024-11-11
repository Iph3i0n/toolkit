import { IResponse } from "@ipheion/puristee";
import Ejs from "ejs";
import Path from "node:path";

export class EjsResponse implements IResponse {
  readonly #view: string;
  readonly #data: Ejs.Data;

  constructor(view: string, data: Ejs.Data) {
    this.#view = view;
    this.#data = data;
  }

  get status() {
    return 200;
  }

  get headers() {
    return {
      "content-type": "text/html",
    };
  }

  get cookies() {
    return {};
  }

  get body() {
    return new Promise<string>((res, rej) =>
      Ejs.renderFile(
        Path.resolve(__dirname, "../views", this.#view + ".ejs"),
        this.#data,
        (err, data) => (err ? rej(err) : res(data))
      )
    );
  }
}
