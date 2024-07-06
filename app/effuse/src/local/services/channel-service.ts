import { Role } from "local/models/role";
import { User } from "local/models/user";
import { State } from "local/server";
import { AuthService } from "./auth-service";
import { PureRequest } from "@ipheion/puristee";

export class ChannelService {
  readonly #state: State;
  readonly #auth_service: AuthService;

  constructor(state: State, auth_service: AuthService) {
    this.#state = state;
    this.#auth_service = auth_service;
  }

  UserMayRead(channel_id: string, user: User, role?: Role) {
    return (
      user.admin ||
      role?.admin ||
      !!user.policies.find((p) => p.channel_id === channel_id) ||
      !!role?.policies.find((p) => p.channel_id === channel_id)
    );
  }

  UserMayWrite(channel_id: string, user: User, role?: Role) {
    return (
      user.admin ||
      role?.admin ||
      !!user.policies.find(
        (p) => p.channel_id === channel_id && p.access === "Write"
      ) ||
      !!role?.policies.find(
        (p) => p.channel_id === channel_id && p.access === "Write"
      )
    );
  }

  async MayRead(request: PureRequest, channel_id: string) {
    const { user, role } = await this.#auth_service.GetUser(request);
    if (!user) return false;
    return (
      user.admin ||
      role?.admin ||
      !!user.policies.find((p) => p.channel_id === channel_id) ||
      !!role?.policies.find((p) => p.channel_id === channel_id)
    );
  }

  async MayWrite(request: PureRequest, channel_id: string) {
    const { user, role } = await this.#auth_service.GetUser(request);
    if (!user) return false;
    return (
      user.admin ||
      role?.admin ||
      !!user.policies.find(
        (p) => p.channel_id === channel_id && p.access === "Write"
      ) ||
      !!role?.policies.find(
        (p) => p.channel_id === channel_id && p.access === "Write"
      )
    );
  }
}
