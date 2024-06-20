import { EmptyResponse, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler, State, Result } from "../server";
import { IsString } from "@ipheion/safe-type";

export class GetPublicProfile extends Handler {
  async Process(request: PureRequest, state: State) {
    const { userId } = request.Parameters({ userId: IsString }) ?? {};
    if (!userId) return new Result(new EmptyResponse("NotFound"));

    const user = state.users[userId];
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
