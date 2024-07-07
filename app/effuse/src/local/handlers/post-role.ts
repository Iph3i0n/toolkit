import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { v4 as Guid } from "uuid";
import { IsObject, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class PostRole extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/roles";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);
    const body = request.Body(IsObject({ Name: IsString, Password: IsString }));

    const id = Guid();

    return new Result(
      new JsonResponse("Created", {
        RoleId: id,
        Name: body.Name,
      }),
      {
        roles: {
          [id]: {
            version: 1,
            name: body.Name,
            admin: false,
            policies: [],
            password: body.Password,
          },
        },
      }
    );
  }
}
