import { addHours } from "date-fns";
import { IJwtClient } from "integrations/i-jwt-client";
import { IsLiteral, IsObject, IsString } from "@ipheion/safe-type";
import { EmptyResponse, PureRequest } from "@ipheion/puristee";
import { State } from "local/server";
import { UserGrant } from "local/models/user-grant";
import { User } from "local/models/user";
import { Role } from "local/models/role";
import { Cache } from "utils/cache";
import BCrypt from "bcrypt";

type AuthContext = {
  user?: User;
  user_id?: string;
  role?: Role;
};

export class AuthService {
  readonly #state: State;
  readonly #jwt_client: IJwtClient;

  static readonly #cache = new Cache<AuthContext>(100);

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

  async GetUser(request: PureRequest): Promise<AuthContext> {
    const head = request.headers.authorization;
    if (!head) return {};

    const token = head.replace("Bearer ", "");
    return this.GetTokenUser(token);
  }

  async GetTokenUser(token: string) {
    const cached = AuthService.#cache.Get(token);
    if (cached) return cached;

    const payload = await this.#jwt_client.DecodeJwt(
      token,
      IsObject({ UserId: IsString })
    );

    const user = this.#state.users[payload.UserId];
    if (!user || user.banned) throw new EmptyResponse("Unauthorised");
    const result: AuthContext = {
      user,
      user_id: payload.UserId,
      role: user.role ? this.#state.roles[user.role] : undefined,
    };

    AuthService.#cache.Set(token, result);
    return result;
  }

  async RequireUser(request: PureRequest): Promise<void> {
    const { user } = await this.GetUser(request);
    if (!user) {
      throw new EmptyResponse("Unauthorised");
    }
  }

  async RequireAdmin(request: PureRequest): Promise<void> {
    const { role } = await this.GetUser(request);
    if (!role?.admin) {
      throw new EmptyResponse("Unauthorised");
    }
  }

  async CreateInviteUrl(role_id: string) {
    const role = this.#state.roles[role_id];
    if (!role) throw new EmptyResponse("NotFound");

    const token = await this.#jwt_client.CreateJwt(
      {
        type: "server_invite",
        role_id: role_id,
      },
      2
    );

    const metadata = this.#state.server_metadata["default"];

    const url = new URL("/join-server", process.env.UI_URL);
    url.searchParams.set("server_url", process.env.SERVER_URL ?? "");
    url.searchParams.set("server_name", metadata?.name ?? "Unnamed Server");
    url.searchParams.set("token", token);

    return url.href;
  }

  async GetInviteRoleId(token: string) {
    const result = await this.#jwt_client.DecodeJwt(
      token,
      IsObject({ type: IsLiteral("server_invite"), role_id: IsString })
    );

    return result.role_id;
  }

  async EncryptPassword(password: string) {
    const salt = await BCrypt.genSalt(10);
    return await BCrypt.hash(password, salt);
  }

  async IsMatch(password: string, hashed_password: string) {
    return await BCrypt.compare(password, hashed_password);
  }
}
