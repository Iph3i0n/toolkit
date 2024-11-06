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
export default class DeleteRoleChannel extends Handler {
  readonly Method = HttpMethod.Delete;
  readonly Url = "/api/v1/roles/:role_id/channels/:channel_id";

  async Process(request: PureRequest) {
    const { role_id, channel_id } = request.Parameters({
      role_id: IsString,
      channel_id: IsString,
    });

    const existing = this.State.roles[role_id];
    if (!existing) return new EmptyResponse("NotFound");

    return new Result(new JsonResponse("NoContent", { Message: "Success" }), {
      roles: {
        [role_id]: {
          ...existing,
          policies: existing.policies.filter(
            (p) => p.channel_id !== channel_id
          ),
        },
      },
    });
  }
}
