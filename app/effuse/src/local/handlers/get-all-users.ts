import { HttpMethod, JsonResponse } from "@ipheion/puristee";
import { RequireUser } from "local/authorise";
import { Handler } from "local/server";

@RequireUser
export default class GetAllUsers extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/users";

  async Process() {
    return new JsonResponse(
      "Ok",
      this.State.users
        .Filter((_, u) => !u.banned)
        .map(([id, user]) => ({ UserId: id, Role: user.role }))
    );
  }
}
