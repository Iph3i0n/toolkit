import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { RequireAdmin } from "local/authorise";
import { Handler, Result } from "local/server";

@RequireAdmin
export default class DeleteBannedUser extends Handler {
  readonly Method = HttpMethod.Delete;
  readonly Url = "/api/v1/banned-users/:user_id";

  async Process(request: PureRequest) {
    const { user_id } = request.Parameters({ user_id: IsString });

    const existing = this.State.users[user_id];
    if (!existing) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("NoContent", { Message: "Success" }), {
      users: {
        [user_id]: {
          ...existing,
          banned: false,
        },
      },
    });
  }
}
