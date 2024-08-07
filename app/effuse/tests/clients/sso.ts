import {
  Assert,
  IsArray,
  IsDictionary,
  IsLiteral,
  IsObject,
  IsString,
} from "@ipheion/safe-type";
import { Url } from "../utils/url";
import { UserGrant } from "../models/user-grant";
import { UserProfile } from "../models/user-profile";
import { UserPublicProfile } from "../models/user-public-profile";
import { UserSubscription } from "../models/user-subscription";
import { ClientBase } from "./base";

export class SsoClient extends ClientBase {
  constructor() {
    super({ baseURL: process.env.SSO_BASE });
  }

  async HeartBeat() {
    const response = await this.get("/api/v1/heartbeat");

    Assert(IsObject({ Text: IsLiteral("Hello world") }), response.data);
    return response.headers as Record<string, string>;
  }

  async GetProfilePicture(user_id: string) {
    await this.get(Url("/profile/pictures/:user_id", { user_id }));
  }

  async GetProfile(grant: UserGrant): Promise<UserProfile> {
    const { data } = await this.get("/api/v1/user/profile", {
      headers: grant.AdminHeaders,
    });

    Assert(
      IsObject({
        UserId: IsString,
        Email: IsString,
        UserName: IsString,
        Biography: IsString,
        RegisteredAt: IsString,
        LastSignIn: IsString,
        Servers: IsArray(
          IsObject({
            Url: IsString,
            JoinedAt: IsString,
          })
        ),
      }),
      data
    );

    return {
      ...data,
      RegisteredAt: new Date(data.RegisteredAt),
      LastSignIn: new Date(data.LastSignIn),
      Servers: data.Servers.map((s) => ({
        Url: s.Url,
        JoinedAt: new Date(s.JoinedAt),
      })),
    };
  }

  async GetPublicProfile(user_id: string): Promise<UserPublicProfile> {
    const { data } = await this.get(
      Url("/api/v1/users/:user_id/profile", { user_id })
    );

    Assert(
      IsObject({
        UserId: IsString,
        UserName: IsString,
        Biography: IsString,
      }),
      { data }
    );

    return data;
  }

  async GetPushSubscriptions(
    grant: UserGrant
  ): Promise<Array<UserSubscription>> {
    const response = await this.get("/api/v1/user/push-subscriptions", {
      headers: grant.AdminHeaders,
    });

    Assert(
      IsArray(
        IsObject({
          Endpoint: IsString,
          Expires: IsString,
          Keys: IsDictionary(IsString),
        })
      ),
      response.data
    );

    return response.data.map((d) => ({ ...d, Expires: new Date(d.Expires) }));
  }

  async GetRefreshToken(grant: UserGrant): Promise<UserGrant> {
    const { data } = await this.get(
      Url("/api/v1/auth/refresh-token", { token: grant.RefreshToken })
    );

    Assert(
      IsObject({
        AdminToken: IsString,
        ServerToken: IsString,
        UserId: IsString,
        RefreshToken: IsString,
        Expires: IsString,
      }),
      data
    );

    return {
      AdminHeaders: {
        Authorization: `Bearer ${data.AdminToken}`,
      },
      RefreshToken: data.RefreshToken,
      ServerToken: data.ServerToken,
      UserId: data.UserId,
      Expires: new Date(data.Expires),
    };
  }

  async GetToken(email: string, password: string): Promise<UserGrant> {
    const { data } = await this.get(
      Url("/api/v1/auth/token", { email, password })
    );

    Assert(
      IsObject({
        AdminToken: IsString,
        ServerToken: IsString,
        UserId: IsString,
        RefreshToken: IsString,
        Expires: IsString,
      }),
      data
    );

    return {
      AdminHeaders: {
        Authorization: `Bearer ${data.AdminToken}`,
      },
      RefreshToken: data.RefreshToken,
      ServerToken: data.ServerToken,
      UserId: data.UserId,
      Expires: new Date(data.Expires),
    };
  }

  async GetUserFromToken(grant: UserGrant) {
    const response = await this.get(
      Url("/api/v1/auth/user", { token: grant.ServerToken })
    );

    Assert(
      IsObject({
        UserId: IsString,
      }),
      response.data
    );

    return response.data.UserId;
  }

  async PostPushSubscription(
    model: { endpoint: string; expires: Date; keys: Record<string, string> },
    grant: UserGrant
  ) {
    const response = await this.post(
      "/api/v1/user/push-subscriptions",
      {
        Endpoint: model.endpoint,
        Expires: model.expires.getTime(),
        Keys: model.keys,
      },
      {
        headers: grant.AdminHeaders,
      }
    );

    Assert(IsObject({ Message: IsLiteral("Success") }), response.data);
  }

  async PostServer(
    model: { server_url: string; password?: string },
    grant: UserGrant
  ) {
    const response = await this.post(
      "/api/v1/user/servers",
      {
        ServerToken: grant.ServerToken,
        ServerUrl: model.server_url,
        Password: model.password,
      },
      {
        headers: grant.AdminHeaders,
      }
    );

    Assert(IsObject({ Success: IsLiteral(true) }), response.data);
  }

  async PostUser(model: {
    user_name: string;
    email: string;
    password: string;
  }): Promise<UserGrant> {
    const { data } = await this.post("/api/v1/users", {
      UserName: model.user_name,
      Email: model.email,
      Password: model.password,
    });

    Assert(
      IsObject({
        AdminToken: IsString,
        ServerToken: IsString,
        UserId: IsString,
        RefreshToken: IsString,
        Expires: IsString,
      }),
      data
    );

    return {
      AdminHeaders: {
        Authorization: `Bearer ${data.AdminToken}`,
      },
      RefreshToken: data.RefreshToken,
      ServerToken: data.ServerToken,
      UserId: data.UserId,
      Expires: new Date(data.Expires),
    };
  }

  async PutProfile(
    model: {
      user_name: string;
      biography: string;
      picture: {
        base64data: string;
        mime_type: string;
      };
    },
    grant: UserGrant
  ) {
    const { data } = await this.put(
      "/api/v1/user/profile",
      {
        UserName: model.user_name,
        Biography: model.biography,
        Picture: {
          Base64Data: model.picture.base64data,
          MimeType: model.picture.mime_type,
        },
      },
      {
        headers: grant.AdminHeaders,
      }
    );

    Assert(
      IsObject({
        UserId: IsString,
        Email: IsString,
        UserName: IsString,
        Biography: IsString,
        RegisteredAt: IsString,
        LastSignIn: IsString,
        Servers: IsArray(
          IsObject({
            Url: IsString,
            JoinedAt: IsString,
          })
        ),
      }),
      data
    );

    return {
      ...data,
      RegisteredAt: new Date(data.RegisteredAt),
      LastSignIn: new Date(data.LastSignIn),
      Servers: data.Servers.map((s) => ({
        Url: s.Url,
        JoinedAt: new Date(s.JoinedAt),
      })),
    };
  }

  async HeartBeatOptions() {
    const response = await this.options("/api/v1/heartbeat");

    return response.headers as Record<string, string>;
  }
}
