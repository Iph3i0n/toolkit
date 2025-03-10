import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
  Express,
} from "express";
import Request from "request";
import Response from "response";

export interface IHandler {
  Handle(request: Request): Promise<Response>;
}

export type HttpMethod = "get" | "put" | "post" | "patch" | "delete";

export function Handler(url: string, method: HttpMethod) {
  return (subject: new () => IHandler): any => {
    return (app: Express) => {
      app[method](url, async (req: ExpressRequest, res: ExpressResponse) => {
        try {
          const instance = new subject();
          const result = await instance.Handle(new Request(req));
          result.Accept(res);
        } catch (err) {
          console.error(err);
          res.status(500);
          res.send("Internal Server Error");
        }
      });
    };
  };
}
