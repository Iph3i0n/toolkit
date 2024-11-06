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
export default class DeleteAdminRole extends Handler {
  readonly Method = HttpMethod.Delete;
  readonly Url = "/api/v1/admin-roles/:role_id";

  async Process(request: PureRequest) {
    const { role_id } = request.Parameters({ role_id: IsString });
    const role = this.State.roles[role_id];
    if (!role) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("NoContent", { Message: "Success" }), {
      roles: {
        [role_id]: {
          ...role,
          admin: false,
        },
      },
    });
  }
}
