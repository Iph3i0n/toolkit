import ArrayableRecord from "../utils/arrayable-record";
import { InternalRequest } from "../contracts";

export default function Cookies(request: InternalRequest) {
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
