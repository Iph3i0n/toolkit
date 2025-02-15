import { Request } from "express";
import Response, { RedirectResponse } from "response";

export function Authenticated(
  original: (request: Request) => Promise<Response>,
  _: ClassMethodDecoratorContext<any, (request: Request) => Promise<Response>>
) {
  return function (this: any, request: Request) {
    const cookies = request.cookies.auth;
    if (!cookies)
      return new RedirectResponse(303, "")

    return original.call(this, request);
  };
}
