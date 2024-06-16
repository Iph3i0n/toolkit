import {
  Directory,
  Schema,
  StateReader,
} from "@ipheion/fs-db";
import Http, { IncomingMessage } from "node:http";
import Send from "./response-applier";
import HandlerFactory, { Middleware } from "./handler";
import { HandlerStore } from "./handler-store";
import Pattern from "./pattern";
import PureRequest from "./pure-request";
import Provider from "./providers";

export default function CreateServer<
  TSchema extends Schema,
  TProviders extends Provider<TSchema>
>(
  state_dir: string,
  schema: TSchema,
  provider?: new (state: StateReader<TSchema>) => TProviders
) {
  const store = new HandlerStore<TSchema, TProviders>();

  async function Run(
    request: IncomingMessage,
    current_state: StateReader<TSchema>
  ) {
    try {
      const url = new URL(request.url ?? "/", `http://${request.headers.host}`);
      const target = store.Get(url, request.method?.toLowerCase() ?? "get");
      if (!target) {
        console.log(`No handler found for ${request.url}`);
        return { response: { status: 404 } };
      }

      console.log(`Handling request for ${request.url}`);
      const [_, pattern, handler] = target;
      const result = await handler(
        await PureRequest.Init(request, pattern),
        current_state,
        provider ? new provider(current_state) : undefined
      );

      if ("response" in result)
        return { response: result.response, state: result.state };

      return { response: result, state: undefined };
    } catch (err) {
      console.error(err);
      return { response: { status: 500 } };
    }
  }

  return {
    CreateHandler(pattern: string, method: string) {
      return HandlerFactory<TSchema, TProviders>((handler) =>
        store.Add(method, new Pattern(pattern), handler)
      );
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
    CreateMiddleware<
      TContext extends Record<never, never>,
      TResponse extends Record<never, never>
    >(handler: Middleware<TSchema, TProviders, TContext, TResponse>) {
      return handler;
    },
  };
}
