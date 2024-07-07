import { addHours } from "date-fns";
import { IJwtClient } from "integrations/i-jwt-client";
import { IsObject, IsString } from "@ipheion/safe-type";
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
}
