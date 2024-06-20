import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { Handler, State, Result } from "../server";
import { IsString } from "@ipheion/safe-type";

export default class GetPublicProfile extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/users/{userId}/profile";

  async Process(request: PureRequest) {
    const { userId } = request.Parameters({ userId: IsString }) ?? {};
    if (!userId) return new Result(new EmptyResponse("NotFound"));

    const user = this.State.users[userId];
    if (!user) return new Result(new EmptyResponse("NotFound"));
    return new Result(
      new JsonResponse("Ok", {
        UserId: user.user_id,
        UserName: user.username,
        Biography: user.biography,
      })
    );
  }
}
