import { ISerialiseable, Write } from "@ipheion/moulding-tin";
import { parentPort } from "node:worker_threads";

export function Send<T>(
  connection_id: string,
  schema: ISerialiseable<T>,
  data: T
) {
  parentPort?.postMessage({
    type: "WS_POST",
    connection_id,
    data: Write(schema, data),
  });
}
