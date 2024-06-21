import {
  Assert,
  IsArray,
  IsDictionary,
  IsLiteral,
  IsObject,
  IsString,
} from "@ipheion/safe-type";
import Axios from "axios";
import { Url } from "../utils/url";
import { UserGrant } from "../models/user-grant";
import { UserProfile } from "../models/user-profile";
import { UserPublicProfile } from "../models/user-public-profile";
import { UserSubscription } from "../models/user-subscription";

export class SsoClient {
  readonly #axios = Axios.create({ baseURL: process.env.SSO_BASE });

  async HeartBeat() {
    const response = await this.#axios.get("/api/v1/heartbeat");

    Assert(IsObject({ Text: IsLiteral("Hello world") }), response.data);
  }

  async GetProfilePicture(user_id: string) {
    const response = await this.#axios.get(
      Url("/profile/pictures/:user_id", { user_id })
    );
  }

  async GetProfile(grant: UserGrant) {
    const response = await this.#axios.get("/api/v1/user/profile", {
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
      response.data
    );

    return new UserProfile(response.data);
  }

  async GetPublicProfile(user_id: string) {
    const response = await this.#axios.get(
      Url("/api/v1/users/:user_id/profile", { user_id })
    );

    Assert(
      IsObject({
        UserId: IsString,
        UserName: IsString,
        Biography: IsString,
      }),
      response.data
    );

    return new UserPublicProfile(response.data);
  }

  async GetPushSubscriptions(grant: UserGrant) {
    const response = await this.#axios.get("/api/v1/user/push-subscriptions", {
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

    return response.data.map((d) => new UserSubscription(d));
  }

  async GetRefreshToken(grant: UserGrant) {
    const response = await this.#axios.get(
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
      response.data
    );

    return new UserGrant(response.data);
  }

  async GetToken(email: string, password: string) {
    const response = await this.#axios.get(
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
      response.data
    );

    return new UserGrant(response.data);
  }

  async GetUserFromToken(grant: UserGrant) {
    const response = await this.#axios.get(
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
    const response = await this.#axios.post(
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

  async JoinServer(
    model: { server_token: string; server_url: string; password: string },
    grant: UserGrant
  ) {
    const response = await this.#axios.post(
      "/api/v1/user/servers",
      {
        ServerToken: model.server_token,
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
  }) {
    const response = await this.#axios.post("/api/v1/users", {
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
      response.data
    );

    return new UserGrant(response.data);
  }

  async PutProfile(model: {
    user_name: string;
    biography: string;
    picture: {
      base64data: string;
      mime_type: string;
    };
  }) {
    const response = await this.#axios.put("/api/v1/user/profile", {
      UserName: model.user_name,
      Biography: model.biography,
      Picture: {
        Base64Data: model.picture.base64data,
        MimeType: model.picture.mime_type,
      },
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
      response.data
    );

    return new UserProfile(response.data);
  }
}
