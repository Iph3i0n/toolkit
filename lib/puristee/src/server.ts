import { Directory, Schema, StateReader } from "@ipheion/fs-db";
import Http, { IncomingMessage } from "node:http";
import Send from "./response-applier";
import { HandlerFactory, Handler } from "./handler";
import { HandlerStore } from "./handler-store";
import Pattern from "./pattern";
import PureRequest from "./pure-request";
import { EmptyResponse } from "./response";

export default function CreateServer<TSchema extends Schema>(
  state_dir: string,
  schema: TSchema
) {
  const store = new HandlerStore<TSchema>();

  async function Run(
    request: IncomingMessage,
    current_state: StateReader<TSchema>
  ) {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
      const target = store.Get(url, request.method?.toLowerCase() ?? "get");
      if (!target) {
        console.log(`No handler found for ${request.url}`);
        return { response: new EmptyResponse("NotFound") };
      }

      console.log(`Handling request for ${request.url}`);
      const [_, pattern, Handler] = target;
      const instance = new Handler();
      const result = await instance.Process(
        await PureRequest.Init(request, pattern),
        current_state
      );

      if ("response" in result)
        return { response: result.response, state: result.state };

      return { response: result, state: undefined };
    } catch (err) {
      console.error(err);
      return { response: new EmptyResponse("InternalServerError") };
    }
  }

  return {
    Handler: Handler<TSchema>,
    WithHandler(
      pattern: string,
      method: string,
      handler: HandlerFactory<TSchema>
    ) {
      store.Add(method, new Pattern(pattern), handler);
    },
    async Listen(port: number) {
      const state_manager = new Directory(schema, state_dir);
      const server = Http.createServer(async (req, res) => {
        const { response, state } = await Run(req, state_manager.Model);
        if (state) state_manager.Write(state);

        await Send(response, res);
      });

      server.listen(port, () => console.log(`Server listening on ${port}`));
    },
  };
}
