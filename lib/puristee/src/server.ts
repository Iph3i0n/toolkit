import Fs from "node:fs/promises";
import Path from "node:path";
import { Directory, Schema } from "@ipheion/fs-db";
import Http, { IncomingMessage } from "node:http";
import Send from "./response-applier";
import { HandlerFactory, Handler, Result } from "./handler";
import { HandlerStore } from "./handler-store";
import Pattern from "./pattern";
import PureRequest from "./pure-request";
import { EmptyResponse } from "./response";

export default function CreateServer<TSchema extends Schema>(
  state_dir: string,
  schema: TSchema,
  default_headers?: Record<string, string>
) {
  const store = new HandlerStore<TSchema>();
  const state_manager = new Directory(schema, state_dir);

  async function Run(request: IncomingMessage) {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
      const target = store.Get(url, request.method?.toLowerCase() ?? "get");
      if (!target) {
        console.log(`No handler found for ${request.method}:${request.url}`);
        return { response: new EmptyResponse("NotFound") };
      }

      console.log(`Handling request for ${request.url}`);
      const [_, pattern, instance] = target;
      const result = await instance.Process(
        await PureRequest.Init(request, pattern)
      );

      return { response: result.response, state: result.state };
    } catch (err) {
      console.error(err);
      return { response: new EmptyResponse("InternalServerError") };
    }
  }

  return {
    Handler: Handler<TSchema>,
    Response: Result<TSchema>,
    async Start(dir: string, port: number) {
      const handlers = await Fs.readdir(dir);
      for (const item of handlers) {
        if (!item.endsWith(".js")) continue;
        const loc = Path.resolve(dir, item);
        const Constructor: HandlerFactory<TSchema> = require(loc).default;

        const instance = new Constructor(state_manager.Model);

        store.Add(instance.Method, new Pattern(instance.Url), instance);
      }

      const server = Http.createServer(async (req, res) => {
        const { response, state } = await Run(req);
        if (state) state_manager.Write(state);

        for (const header in default_headers)
          res.setHeader(header, default_headers[header]);
        await Send(response, res);
      });

      server.listen(port, () => console.log(`Server listening on ${port}`));
    },
  };
}
