import { EmptyResponse, HttpMethod, PureRequest } from "@ipheion/puristee";
import { IsObject, IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { Handler, Result } from "local/server";
import { AuthService } from "local/services/auth-service";

export default class PutMetadata extends Handler {
  readonly #auth_service: AuthService;

  constructor(auth_service?: AuthService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
  }

  readonly Method = HttpMethod.Put;
  readonly Url = "/api/v1/server/metadata";

  async Process(request: PureRequest) {
    await this.#auth_service.RequireAdmin(request);

    const body = request.Body(
      IsObject({
        ServerName: IsString,
        IconBase64: IsString,
        IconMimeType: IsString,
      })
    );

    return new Result(new EmptyResponse("Ok"), {
      server_metadata: {
        default: {
          name: body.ServerName,
          icon: Buffer.from(body.IconBase64, "base64"),
          icon_mime: body.IconMimeType,
        },
      },
    });
  }
}
