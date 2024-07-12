import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { v4 as Guid } from "uuid";
import { IsObject, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class PutRole extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/roles/:role_id";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const body = request.Body(IsObject({ Name: IsString }));
    const { role_id } = request.Parameters({ role_id: IsString });

    const role = this.State.roles[role_id];
    if (!role) return new EmptyResponse("NotFound");

    return new Result(
      new JsonResponse("Created", {
        RoleId: role_id,
        Name: body.Name,
      }),
      {
        roles: {
          [role_id]: {
            ...role,
            name: body.Name,
          },
        },
      }
    );
  }
}
