import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { Handler } from "server";
import { Login } from "utils/authenticate";

export default class extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/token";

  async Process(request: PureRequest) {
    const { username, password } = request.Parameters({
      username: IsString,
      password: IsString,
    });

    const jwt = Login(username, password);
    if (!jwt) return new EmptyResponse("Unauthorised");
    return new JsonResponse("Ok", { token: jwt });
  }
}
