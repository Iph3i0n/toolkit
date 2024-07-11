import {
  DoNotCare,
  IsArray,
  IsBoolean,
  IsLiteral,
  IsObject,
  IsString,
} from "@ipheion/safe-type";
import { ApiClient } from "./api-client";
import { GrantManager } from "./grant-manager";
import { ServerGrant } from "user-interface/models/server-grant";
import { TransformFile } from "./file";
import { SsoClient } from "./sso";

export class LocalClient {
  readonly #sso: SsoClient;
  readonly #grant_manager: GrantManager<ServerGrant>;
  readonly #client: ApiClient;

  constructor(
    sso: SsoClient,
    base_url: string,
    grant_manager: GrantManager<ServerGrant>
  ) {
    this.#sso = sso;
    this.#grant_manager = grant_manager;
    this.#client = new ApiClient(base_url);
  }

  get Sso() {
    return this.#sso;
  }

  get #headers() {
    return this.#grant_manager.GetGrant().then((r) => r.LocalHeaders);
  }

  async GetMetadata() {
    return this.#client.Send({
      method: "GET",
      url: "/api/v1/server/metadata",
      expect: IsObject({
        ServerName: IsString,
        Icon: IsObject({
          Base64Data: IsString,
          MimeType: IsString,
        }),
      }),
    });
  }

  async PutMetadata(name: string, image: File) {
    const { base64, mime } = await TransformFile(image);

    await this.#client.Send({
      method: "PUT",
      url: "/api/v1/server/metadata",
      headers: await this.#headers,
      body: {
        ServerName: name,
        IconBase64: base64,
        IconMimeType: mime,
      },
      expect: DoNotCare,
    });
  }

  async GetAllChannels() {
    return await this.#client.Send({
      method: "GET",
      url: "/api/v1/channels",
      headers: await this.#headers,
      expect: IsArray(
        IsObject({ ChannelId: IsString, Type: IsString, Name: IsString })
      ),
    });
  }

  async PostChannel(name: string, type: string) {
    return await this.#client.Send({
      method: "POST",
      url: "/api/v1/channels",
      headers: await this.#headers,
      body: {
        Name: name,
        Type: type,
      },
      expect: IsObject({
        ChannelId: IsString,
        Type: IsString,
        Name: IsString,
      }),
    });
  }

  async GetAllBannedUsers() {
    return await this.#client.Send({
      method: "GET",
      url: "/api/v1/banned-users",
      headers: await this.#headers,
      expect: IsArray(IsObject({ UserId: IsString })),
    });
  }

  async PostBannedUser(user_id: string) {
    return await this.#client.Send({
      method: "POST",
      url: "/api/v1/banned-users",
      body: { UserId: user_id },
      headers: await this.#headers,
      expect: IsObject({ Message: IsLiteral("Success") }),
    });
  }

  async GetAllUsers() {
    return await this.#client.Send({
      method: "GET",
      url: "/api/v1/users",
      headers: await this.#headers,
      expect: IsArray(IsObject({ UserId: IsString, Role: IsString })),
    });
  }

  async GetAllRoles() {
    return await this.#client.Send({
      method: "GET",
      url: "/api/v1/roles",
      headers: await this.#headers,
      expect: IsArray(
        IsObject({
          RoleId: IsString,
          Name: IsString,
        })
      ),
    });
  }

  async GetAllRolesAdmin() {
    return await this.#client.Send({
      method: "GET",
      url: "/api/v1/roles",
      params: { with_permissions: "true" },
      headers: await this.#headers,
      expect: IsArray(
        IsObject({
          RoleId: IsString,
          Name: IsString,
          Admin: IsBoolean,
          Policies: IsArray(
            IsObject({
              ChannelId: IsString,
              Write: IsBoolean,
            })
          ),
        })
      ),
    });
  }

  async IsAdmin() {
    return (await this.#grant_manager.GetGrant()).IsAdmin;
  }
}
