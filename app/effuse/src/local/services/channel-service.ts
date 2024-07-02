import { Role } from "local/models/role";
import { User } from "local/models/user";
import { State } from "local/server";

export class ChannelService {
  readonly #state: State;

  constructor(state: State) {
    this.#state = state;
  }

  MayRead(channel_id: string, user: User, role?: Role) {
    return (
      user.admin ||
      role?.admin ||
      !!user.policies.find((p) => p.channel_id === channel_id) ||
      !!role?.policies.find((p) => p.channel_id === channel_id)
    );
  }

  MayWrite(channel_id: string, user: User, role?: Role) {
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
