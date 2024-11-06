import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { RequireAdmin } from "local/authorise";
import { Handler } from "local/server";

@RequireAdmin
export default class GetAllBannedUsers extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/banned-users";

  async Process(request: PureRequest) {
    return new JsonResponse(
      "Ok",
      this.State.users
        .Filter((_, u) => u.banned)
        .map(([id]) => ({ UserId: id }))
    );
  }
}
