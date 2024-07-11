import {
  IsArray,
  IsBoolean,
  IsDictionary,
  IsLiteral,
  IsObject,
  IsString,
} from "@ipheion/safe-type";
import { SSO_BASE } from "effuse-config";
import { UserGrant } from "../models/user-grant";
import { UserProfile } from "../models/user-profile";
import { UserPublicProfile } from "../models/user-public-profile";
import { UserSubscription } from "../models/user-subscription";
import { ApiClient } from "./api-client";
import { GrantManager } from "./grant-manager";
import { ServerGrant } from "user-interface/models/server-grant";
import { LocalClient } from "./local";
import { TransformFile } from "./file";

const Grant = IsObject({
  AdminToken: IsString,
  ServerToken: IsString,
  UserId: IsString,
  RefreshToken: IsString,
  Expires: IsString,
});

export class SsoClient {
  readonly #grant_manager: GrantManager<UserGrant>;
  readonly #client: ApiClient;

  private constructor(grant: UserGrant) {
    this.#grant_manager = new GrantManager(
      grant,
      grant.Expires.getTime(),
      async (grant) => {
        const data = await this.#client.Send({
          method: "GET",
          url: "/api/v1/auth/refresh-token",
          params: { token: grant.RefreshToken },
          expect: Grant,
        });

        localStorage.setTime("grant", JSON.stringify(data));

        return [
          {
            AdminHeaders: {
              Authorization: `Bearer ${data.AdminToken}`,
            },
            RefreshToken: data.RefreshToken,
            ServerToken: data.ServerToken,
            UserId: data.UserId,
            Expires: new Date(data.Expires),
          },
          new Date(data.Expires).getTime(),
        ];
      }
    );
    this.#client = new ApiClient(SSO_BASE);
  }

  static async Attempt() {
    let data = JSON.parse(localStorage.getItem("grant") ?? "{}");
    if (!data || !Grant(data)) return undefined;

    if (new Date(data.Expires).getTime() <= new Date().getTime()) {
      try {
        const client = new ApiClient(SSO_BASE);
        data = await client.Send({
          method: "GET",
          url: "/api/v1/auth/refresh-token",
          params: { token: data.RefreshToken },
          expect: Grant,
        });

        localStorage.setTime("grant", JSON.stringify(data));
      } catch (err) {
        console.error(err);
        return undefined;
      }
    }

    return new SsoClient({
      AdminHeaders: {
        Authorization: `Bearer ${data.AdminToken}`,
      },
      RefreshToken: data.RefreshToken,
      ServerToken: data.ServerToken,
      UserId: data.UserId,
      Expires: new Date(data.Expires),
    });
  }

  static async Login(email: string, password: string) {
    const client = new ApiClient(SSO_BASE);
    const data = await client.Send({
      method: "GET",
      url: "/api/v1/auth/token",
      params: { email, password },
      expect: Grant,
    });

    localStorage.setItem("grant", JSON.stringify(data));
    return new SsoClient({
      AdminHeaders: {
        Authorization: `Bearer ${data.AdminToken}`,
      },
      RefreshToken: data.RefreshToken,
      ServerToken: data.ServerToken,
      UserId: data.UserId,
      Expires: new Date(data.Expires),
    });
  }

  static async Register(model: {
    user_name: string;
    email: string;
    password: string;
  }) {
    const client = new ApiClient(SSO_BASE);
    const data = await client.Send({
      method: "POST",
      url: "/api/v1/users",
      body: {
        UserName: model.user_name,
        Email: model.email,
        Password: model.password,
      },
      expect: Grant,
    });

    localStorage.setTime("grant", JSON.stringify(data));
    return new SsoClient({
      AdminHeaders: {
        Authorization: `Bearer ${data.AdminToken}`,
      },
      RefreshToken: data.RefreshToken,
      ServerToken: data.ServerToken,
      UserId: data.UserId,
      Expires: new Date(data.Expires),
    });
  }

  get #headers() {
    return this.#grant_manager.GetGrant().then((r) => r.AdminHeaders);
  }

  async HeartBeat() {
    return await this.#client.Send({
      method: "GET",
      url: "/api/v1/heartbeat",
      expect: IsObject({ Text: IsLiteral("Hello world") }),
    });
  }

  async GetProfile(): Promise<UserProfile> {
    const data = await this.#client.Send({
      url: "/api/v1/user/profile",
      method: "GET",
      headers: await this.#headers,
      expect: IsObject({
        UserId: IsString,
        Email: IsString,
        UserName: IsString,
        Biography: IsString,
        RegisteredAt: IsString,
        LastSignIn: IsString,
        Servers: IsArray(
          IsObject({
            Id: IsString,
            Url: IsString,
            JoinedAt: IsString,
          })
        ),
      }),
    });

    return {
      ...data,
      RegisteredAt: new Date(data.RegisteredAt),
      LastSignIn: new Date(data.LastSignIn),
      Servers: data.Servers.map((s) => ({
        Id: s.Id,
        Url: s.Url,
        JoinedAt: new Date(s.JoinedAt),
      })),
    };
  }

  async GetPublicProfile(user_id: string): Promise<UserPublicProfile> {
    return await this.#client.Send({
      method: "GET",
      url: "/api/v1/users/:user_id/profile",
      params: { user_id },
      expect: IsObject({
        UserId: IsString,
        UserName: IsString,
        Biography: IsString,
      }),
    });
  }

  async GetPushSubscriptions(): Promise<Array<UserSubscription>> {
    const data = await this.#client.Send({
      method: "GET",
      url: "/api/v1/user/push-subscriptions",
      headers: await this.#headers,
      expect: IsArray(
        IsObject({
          Endpoint: IsString,
          Expires: IsString,
          Keys: IsDictionary(IsString),
        })
      ),
    });

    return data.map((d) => ({ ...d, Expires: new Date(d.Expires) }));
  }

  async PostPushSubscription(model: {
    endpoint: string;
    expires: Date;
    keys: Record<string, string>;
  }) {
    await this.#client.Send({
      method: "POST",
      url: "/api/v1/user/push-subscriptions",
      headers: await this.#headers,
      body: {
        Endpoint: model.endpoint,
        Expires: model.expires.getTime(),
        Keys: model.keys,
      },
      expect: IsObject({ Message: IsLiteral("Success") }),
    });
  }

  async PostServer(model: { server_url: string; password?: string }) {
    await this.#client.Send({
      method: "POST",
      url: "/api/v1/user/servers",
      headers: await this.#headers,
      body: {
        ServerToken: (await this.#grant_manager.GetGrant()).ServerToken,
        ServerUrl: model.server_url,
        Password: model.password,
      },
      expect: IsObject({ Success: IsLiteral(true) }),
    });
  }

  async PutProfile(model: {
    user_name: string;
    biography: string;
    picture: File;
  }): Promise<UserProfile> {
    const { base64, mime } = await TransformFile(model.picture);
    const data = await this.#client.Send({
      method: "PUT",
      url: "/api/v1/user/profile",
      headers: await this.#headers,
      body: {
        UserName: model.user_name,
        Biography: model.biography,
        Picture: {
          Base64Data: base64,
          MimeType: mime,
        },
      },
      expect: IsObject({
        UserId: IsString,
        Email: IsString,
        UserName: IsString,
        Biography: IsString,
        RegisteredAt: IsString,
        LastSignIn: IsString,
        Servers: IsArray(
          IsObject({
            Id: IsString,
            Url: IsString,
            JoinedAt: IsString,
          })
        ),
      }),
    });

    return {
      ...data,
      RegisteredAt: new Date(data.RegisteredAt),
      LastSignIn: new Date(data.LastSignIn),
      Servers: data.Servers.map((s) => ({
        Id: s.Id,
        Url: s.Url,
        JoinedAt: new Date(s.JoinedAt),
      })),
    };
  }

  async GetLocalClient(server_url: string) {
    const client = new ApiClient(server_url);
    const create_grant = async (): Promise<ServerGrant> => {
      const data = await client.Send({
        method: "GET",
        url: "/api/v1/auth/token",
        params: { token: (await this.#grant_manager.GetGrant()).ServerToken },
        expect: IsObject({
          LocalToken: IsString,
          IsAdmin: IsBoolean,
          Expires: IsString,
          UserId: IsString,
        }),
      });

      return {
        LocalHeaders: {
          Authorization: `Bearer ${data.LocalToken}`,
        },
        IsAdmin: data.IsAdmin,
        UserId: data.UserId,
        Expires: new Date(data.Expires),
      };
    };

    const start_grant = await create_grant();

    return new LocalClient(
      this,
      server_url,
      new GrantManager(start_grant, start_grant.Expires.getTime(), async () => {
        const result = await create_grant();
        return [result, result.Expires.getTime()];
      })
    );
  }
}
