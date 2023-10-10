import { IsString } from "@ipheion/safe-type";
import { RenderToString } from "./jsx.js";
import { PureResponse } from "./handler.js";
import SetCookies from "./set-cookies";

const AcceptedTypes = [
  Blob,
  ArrayBuffer,
  FormData,
  URLSearchParams,
  Uint8Array,
];

export default async function Send(response: PureResponse | Response) {
  if (response instanceof Response) return response;
  const headers = new Headers(response.headers);

  if (response.cookies)
    for (const value of SetCookies(response.cookies))
      headers.append("Set-Cookie", value);

  if ("jsx" in response) {
    headers.set("Content-Type", "text/html");
    return new Response(
      "<!DOCTYPE html>\n" + (await RenderToString(response.jsx)),
      {
        status: response.status,
        headers,
      }
    );
  }

  const original_body = response.body;
  for (const type of AcceptedTypes)
    if (original_body instanceof type)
      return new Response(original_body, {
        status: response.status,
        headers,
      });

  if (IsString(original_body))
    return new Response(original_body, {
      status: response.status,
      headers,
    });

  headers.set("Content-Type", "application/json");
  return new Response(JSON.stringify(original_body), {
    status: response.status,
    headers,
  });
}
