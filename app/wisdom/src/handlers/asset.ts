import {
  EmptyResponse,
  FileResponse,
  HttpMethod,
  PureRequest,
} from "@ipheion/puristee";
import { Handler } from "server";
import Path from "path";
import Fs from "fs";
import { IsArray, IsString, IsUnion } from "@ipheion/safe-type";

export default class MainPage extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/_/**";

  Process(request: PureRequest) {
    let { slug } = request.Parameters({
      slug: IsUnion(IsString, IsArray(IsString)),
    });
    if (typeof slug === "string") slug = [slug];
    const target = Path.resolve(__dirname, "../..", ...slug);
    console.log(target);
    if (!Fs.existsSync(target)) return new EmptyResponse("NotFound");
    return new FileResponse(target);
  }
}
