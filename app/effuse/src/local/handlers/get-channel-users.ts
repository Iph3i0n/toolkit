import {
  EmptyResponse,
  HttpMethod,
  JsonResponse,
  PureRequest,
} from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { NewAuthService } from "local/bootstrap/services/auth-service";
import { NewChannelService } from "local/bootstrap/services/channel-service";
import { Role } from "local/models/role";
import { User } from "local/models/user";
import { Handler } from "local/server";
import { AuthService } from "local/services/auth-service";
import { ChannelService } from "local/services/channel-service";

export default class GetChannelUsers extends Handler {
  readonly #auth_service: AuthService;
  readonly #channel_service: ChannelService;

  constructor(auth_service?: AuthService, channel_service?: ChannelService) {
    super();
    this.#auth_service = auth_service ?? NewAuthService(this.State);
    this.#channel_service = channel_service ?? NewChannelService(this.State);
  }

  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/channels/:channel_id/users";

  async Process(request: PureRequest) {
    const [user] = await this.#auth_service.GetUser(request);
    if (!user) return new EmptyResponse("Unauthorised");
    const { channel_id } = request.Parameters({ channel_id: IsString }) ?? {};
    if (!channel_id) return new EmptyResponse("BadRequest");
    if (!this.#channel_service.MayRead(channel_id, user))
      return new EmptyResponse("Unauthorised");

    const result: Array<[string, User, Role | undefined]> = [];
    for (const [id, user] of this.State.users) {
      const role = user.role ? this.State.roles[user.role] : undefined;
      if (this.#channel_service.MayRead(channel_id, user, role))
        result.push([id, user, role]);
    }
    return new JsonResponse(
      "Ok",
      result.map(([i, u, r]) => ({
        UserId: i,
        MayRead: this.#channel_service.MayRead(channel_id, u, r),
        MayWrite: this.#channel_service.MayWrite(channel_id, u, r),
      }))
    );
  }
}
