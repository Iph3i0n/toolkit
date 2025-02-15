import { Request, Response as ExpressResponse } from "express";
import Response from "response";

interface IHandler {
  Handle(request: Request): Promise<Response>;
}

export function Handler(subject: new () => IHandler): any {
  return async (req: Request, res: ExpressResponse) => {
    const instance = new subject();
    const result = await instance.Handle(req);
    result.Accept(res);
  };
}
