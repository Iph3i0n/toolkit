import { addHours } from "date-fns";
import { IJwtClient } from "integrations/i-jwt-client";
import { IsObject, IsString } from "@ipheion/safe-type";
import { PureRequest } from "@ipheion/puristee";
import { State } from "local/server";
import { UserGrant } from "local/models/user-grant";

export class AuthService {
  readonly #state: State;
  readonly #jwt_client: IJwtClient;

  constructor(state: State, jwt_client: IJwtClient) {
    this.#state = state;
    this.#jwt_client = jwt_client;
  }

  async CreateGrant(user_id: string) {
    return new UserGrant(
      await this.#jwt_client.CreateJwt(
        {
          UserId: user_id,
        },
        12
      ),
      user_id,
      addHours(new Date(), 12)
    );
  }

  async GetUser(request: PureRequest) {
    const head = request.headers.authorization;
    if (!head) return [undefined, undefined] as const;

    const token = head.replace("Bearer ", "");
    const payload = await this.#jwt_client.DecodeJwt(
      token,
      IsObject({ UserId: IsString })
    );

    return [this.#state.users[payload.UserId], payload.UserId] as const;
  }
}
