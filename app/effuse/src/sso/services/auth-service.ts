import { addHours } from "date-fns";
import { IJwtClient } from "integrations/i-jwt-client";
import { IsObject, IsOneOf, IsString } from "@ipheion/safe-type";
import { PureRequest } from "@ipheion/puristee";
import BCrypt from "bcrypt";
import { State } from "sso/server";
import { UserGrant } from "sso/models/user-grant";

export const UserAccess = Object.freeze({
  Admin: "Admin",
  Identify: "Identify",
});

export type UserAccess = (typeof UserAccess)[keyof typeof UserAccess];

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
          Access: UserAccess.Admin,
        },
        12
      ),
      await this.#jwt_client.CreateJwt(
        {
          UserId: user_id,
          Access: UserAccess.Identify,
        },
        12
      ),
      await this.#jwt_client.CreateJwt(
        {
          UserId: user_id,
        },
        24 * 7
      ),
      user_id,
      addHours(new Date(), 12)
    );
  }

  async GetRefreshUser(token: string) {
    const payload = await this.#jwt_client.DecodeJwt(
      token,
      IsObject({ UserId: IsString })
    );

    return [this.#state.users[payload.UserId], payload.UserId] as const;
  }

  async GetAdminUser(request: PureRequest) {
    const head = request.headers.authorization;
    if (!head) return [undefined, undefined] as const;

    const token = head.replace("Bearer ", "");
    const payload = await this.#jwt_client.DecodeJwt(
      token,
      IsObject({
        UserId: IsString,
        Access: IsOneOf(...Object.keys(UserAccess)),
      })
    );

    if (payload.Access !== UserAccess.Admin)
      return [undefined, undefined] as const;

    return [this.#state.users[payload.UserId], payload.UserId] as const;
  }

  async GetIdentifyUser(request: PureRequest) {
    const { token } = request.Parameters({ token: IsString }) ?? {};
    if (!token) return [undefined, undefined] as const;
    const payload = await this.#jwt_client.DecodeJwt(
      token,
      IsObject({
        UserId: IsString,
        Access: IsOneOf(...Object.keys(UserAccess)),
      })
    );

    if (payload.Access !== UserAccess.Identify)
      return [undefined, undefined] as const;

    return [this.#state.users[payload.UserId], payload.UserId] as const;
  }

  async EncryptPassword(password: string) {
    const salt = await BCrypt.genSalt(10);
    return await BCrypt.hash(password, salt);
  }

  async IsMatch(password: string, hashed_password: string) {
    return await BCrypt.compare(password, hashed_password);
  }
}
