import { addHours } from "date-fns";
import { IJwtClient } from "../integrations/i-jwt-client";
import { User } from "../models/user";
import { IsObject, IsOneOf, IsString } from "@ipheion/safe-type";
import { PureRequest } from "@ipheion/puristee";
import BCrypt from "bcrypt";
import { State } from "../server";

export const UserAccess = Object.freeze({
  Admin: "Admin",
  Identify: "Identify",
});

export type UserAccess = (typeof UserAccess)[keyof typeof UserAccess];

export class UserGrant {
  readonly #user_token: string;
  readonly #server_token: string;
  readonly #refresh_token: string;
  readonly #user_id: string;
  readonly #expires: Date;

  constructor(
    user_token: string,
    server_token: string,
    refresh_token: string,
    user_id: string,
    expires: Date
  ) {
    this.#user_token = user_token;
    this.#server_token = server_token;
    this.#refresh_token = refresh_token;
    this.#user_id = user_id;
    this.#expires = expires;
  }

  get UserToken() {
    return this.#user_token;
  }

  get ServerToken() {
    return this.#server_token;
  }

  get RefreshToken() {
    return this.#refresh_token;
  }

  get UserId() {
    return this.#user_id;
  }

  get Expires() {
    return this.#expires;
  }
}

export class SsoAuthService {
  readonly #jwt_client: IJwtClient;

  constructor(jwt_client: IJwtClient) {
    this.#jwt_client = jwt_client;
  }

  async CreateGrant(user: User) {
    return new UserGrant(
      await this.#jwt_client.CreateJwt(
        {
          UserId: user.user_id,
          Access: UserAccess.Admin,
        },
        12
      ),
      await this.#jwt_client.CreateJwt(
        {
          UserId: user.user_id,
          Access: UserAccess.Identify,
        },
        12
      ),
      await this.#jwt_client.CreateJwt(
        {
          UserId: user.user_id,
        },
        24 * 7
      ),
      user.user_id,
      addHours(new Date(), 12)
    );
  }

  async GetAdminUser(request: PureRequest, state: State) {
    const head = request.headers.Authorization;
    if (!head) return undefined;

    const token = head.replace("Bearer ", "");
    const payload = await this.#jwt_client.DecodeJwt(
      token,
      IsObject({
        UserId: IsString,
        Access: IsOneOf(...Object.keys(UserAccess)),
      })
    );

    if (payload.Access !== UserAccess.Admin) return undefined;

    return state.users[payload.UserId];
  }

  async GetIdentifyUser(request: PureRequest, state: State) {
    const { token } = request.Parameters({ token: IsString }) ?? {};
    if (!token) return undefined;
    const payload = await this.#jwt_client.DecodeJwt(
      token,
      IsObject({
        UserId: IsString,
        Access: IsOneOf(...Object.keys(UserAccess)),
      })
    );

    if (payload.Access !== UserAccess.Identify) return undefined;

    return state.users[payload.UserId];
  }

  async EncryptPassword(password: string) {
    const salt = await BCrypt.genSalt(10);
    return await BCrypt.hash(password, salt);
  }

  async IsMatch(password: string, hashed_password: string) {
    return await BCrypt.compare(password, hashed_password);
  }
}
