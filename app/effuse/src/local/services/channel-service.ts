import { Role } from "local/models/role";
import { User } from "local/models/user";
import { State } from "local/server";
import { AuthService } from "./auth-service";
import { EmptyResponse, PureRequest } from "@ipheion/puristee";

export class ChannelService {
  readonly #state: State;
  readonly #auth_service: AuthService;

  constructor(state: State, auth_service: AuthService) {
    this.#state = state;
    this.#auth_service = auth_service;
  }

  UserMayRead(channel_id: string, user: User, role?: Role) {
    return (
      role?.admin || !!role?.policies.find((p) => p.channel_id === channel_id)
    );
  }

  UserMayWrite(channel_id: string, user: User, role?: Role) {
    return (
      role?.admin ||
      !!role?.policies.find(
        (p) => p.channel_id === channel_id && p.access === "Write"
      )
    );
  }

  async MayRead(request: PureRequest, channel_id: string) {
    const { user, role } = await this.#auth_service.GetUser(request);
    if (!user) return false;
    return (
      role?.admin || !!role?.policies.find((p) => p.channel_id === channel_id)
    );
  }

  async RequireRead(request: PureRequest, channel_id: string) {
    if (!(await this.MayRead(request, channel_id)))
      throw new EmptyResponse("Unauthorised");
  }

  async MayWrite(request: PureRequest, channel_id: string) {
    const { user, role } = await this.#auth_service.GetUser(request);
    if (!user) return false;
    return (
      role?.admin ||
      !!role?.policies.find(
        (p) => p.channel_id === channel_id && p.access === "Write"
      )
    );
  }

  async RequireWrite(request: PureRequest, channel_id: string) {
    if (!(await this.MayWrite(request, channel_id)))
      throw new EmptyResponse("Unauthorised");
  }
}
