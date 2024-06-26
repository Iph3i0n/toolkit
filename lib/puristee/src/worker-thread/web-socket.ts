import { parentPort } from "node:worker_threads";

export function Send<T>(connection_id: string, data: T) {
  parentPort?.postMessage({
    type: "WS_POST",
    connection_id,
    data: JSON.stringify(data),
  });
}
