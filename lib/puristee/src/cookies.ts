import type { IncomingMessage } from "node:http";
import ArrayableRecord from "./arrayable-record";

export default function Cookies(request: IncomingMessage) {
  const header = request.headers.cookie;
  if (!header) return {};

  const result = new ArrayableRecord<string>();

  for (const data of header.split("; ")) {
    const [name, value] = data.split("=");
    if (!name || !value) continue;

    result.Add(decodeURIComponent(name), decodeURIComponent(value));
  }

  return result.Record;
}
