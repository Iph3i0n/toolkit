import type { ServerResponse } from "node:http";
import { IsString } from "@ipheion/safe-type";
import SetCookies from "./set-cookies";
import { IResponse } from "./response";

const AcceptedTypes = [
  Blob,
  ArrayBuffer,
  FormData,
  URLSearchParams,
  Uint8Array,
];

export default async function Send(response: IResponse, res: ServerResponse) {
  const headers = response.headers ?? {};
  for (const key in headers) res = res.setHeader(key, headers[key]);

  if (response.cookies)
    for (const value of SetCookies(response.cookies))
      res = res.setHeader("Set-Cookie", value);

  const original_body = await response.body;
  for (const type of AcceptedTypes)
    if (original_body instanceof type) {
      res.statusCode = await response.status;
      return res.end(original_body);
    }

  if (IsString(original_body)) {
    res.statusCode = await response.status;
    return res.end(original_body);
  }

  res = res.setHeader("Content-Type", "application/json");
  res.statusCode = await response.status;
  return res.end(JSON.stringify(original_body));
}
