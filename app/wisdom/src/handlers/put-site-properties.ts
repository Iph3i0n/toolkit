import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsObject, IsRecord, IsString } from "@ipheion/safe-type";
import { Handler, Result } from "server";
import { Authenticated } from "utils/authenticate";

const IsBody = IsObject({
  properties: IsRecord(IsString, IsString),
});

export default class extends Handler {
  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/site-properties";

  @Authenticated
  async Process(request: PureRequest) {
    const body = request.Body(IsBody);
    return new Result(new JsonResponse("Ok", {}), {
      properties: body.properties,
    });
  }
}
