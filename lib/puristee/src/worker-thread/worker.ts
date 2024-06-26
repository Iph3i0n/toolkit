import { Assert } from "@ipheion/safe-type";
import { parentPort, workerData } from "node:worker_threads";
import { IHandler, InternalRequest, Startup } from "../contracts";
import { HandlerStore } from "./handler-store";

Assert(Startup, workerData);

const handler_store = new HandlerStore();

for (const id in workerData.handlers) {
  const location = workerData.handlers[id];
  const imported: new () => IHandler = require(location).default;
  const instance = new imported();

  if (workerData.log_init)
    console.log(`Added handler for ${instance.Method}:${instance.Url}`);

  handler_store.Add(instance);
}

parentPort?.on("message", async (data) => {
  Assert(InternalRequest, data);

  const not_found = () =>
    parentPort?.postMessage({
      request_id: data.request_id,
      status: 404,
      body: { Error: "Not Found" },
      headers: {},
      cookies: {},
    });

  const handler = handler_store.Get(new URL(data.url), data.method);
  if (!handler) return not_found();

  switch (data.event) {
    case "REST": {
      if (handler.type !== "REST") return not_found();
      return parentPort?.postMessage(await handler.OnRequest(data));
    }
    default: {
      if (handler.type !== "WEBSOCKET") return not_found();
      return parentPort?.postMessage(await handler.OnRequest(data));
    }
  }
});
