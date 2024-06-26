import {
  IsObject,
  IsString,
  IsDictionary,
  IsType,
  IsBoolean,
  DoNotCare,
  IsNumber,
} from "@ipheion/safe-type";
import { SetCookie } from "./set-cookies";
import Pattern from "./pattern";

export const InternalRequest = IsObject({
  request_id: IsString,
  url: IsString,
  method: IsString,
  headers: IsDictionary(IsString),
  body: DoNotCare,
});

export type InternalRequest = IsType<typeof InternalRequest>;

export const InternalResponse = IsObject({
  request_id: IsString,
  status: IsNumber,
  body: DoNotCare,
  headers: IsDictionary(IsString),
  cookies: IsDictionary(SetCookie),
});

export type InternalResponse = {
  request_id: string;
  status: number;
  body: any;
  headers: Record<string, string>;
  cookies: Record<string, SetCookie>;
};

export interface IHandler {
  readonly Method: string;
  readonly Url: string;
  readonly Pattern: Pattern;
  OnRequest(request: InternalRequest): Promise<InternalResponse>;
}

export const Startup = IsObject({
  handlers: IsDictionary(IsString),
  log_init: IsBoolean,
});

export type Startup = IsType<typeof Startup>;
