import type { ServerResponse } from "node:http";
import { IsString } from "@ipheion/safe-type";
import { PureResponse } from "./handler";
import SetCookies from "./set-cookies";

const AcceptedTypes = [
  Blob,
  ArrayBuffer,
  FormData,
  URLSearchParams,
  Uint8Array,
];

export default async function Send(
  response: PureResponse,
  res: ServerResponse
) {
  const headers = response.headers ?? {};
  for (const key in headers) res.setHeader(key, headers[key]);

  if (response.cookies)
    for (const value of SetCookies(response.cookies))
      res.setHeader("Set-Cookie", value);

  const original_body = response.body;
  for (const type of AcceptedTypes)
    if (original_body instanceof type) {
      res.statusCode = response.status;
      res.end(original_body);
    }

  if (IsString(original_body)) {
    res.statusCode = response.status;
    res.end(original_body);
  }

  res.setHeader("Content-Type", "application/json");
  res.statusCode = response.status;
  res.end(JSON.stringify(original_body));
}
