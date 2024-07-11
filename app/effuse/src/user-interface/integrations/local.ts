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

  async PutChannel(channel_id: string, name: string) {
    return await this.#client.Send({
      method: "PUT",
      url: "/api/v1/channels/:channel_id",
      params: { channel_id },
      headers: await this.#headers,
      body: { Name: name },
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
    });
  }

  async DeleteBannedUser(user_id: string) {
    return await this.#client.Send({
      method: "DELETE",
      url: "/api/v1/banned-users/:user_id",
      params: { user_id },
      headers: await this.#headers,
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

  async PutUserRole(user_id: string, role_id: string) {
    return await this.#client.Send({
      method: "PUT",
      url: "/api/v1/users/:user_id/role",
      params: { user_id },
      body: { RoleId: role_id },
      headers: await this.#headers,
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
          Password: IsString,
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

  async PutRole(role_id: string, name: string, password: string) {
    return await this.#client.Send({
      method: "PUT",
      url: "/api/v1/roles/:role_id",
      params: { role_id },
      body: { Name: name, Password: password },
      headers: await this.#headers,
      expect: IsObject({
        RoleId: IsString,
        Name: IsString,
      }),
    });
  }

  async PostAdminRole(role_id: string) {
    return await this.#client.Send({
      method: "POST",
      url: "/api/v1/admin-roles",
      body: { RoleId: role_id },
      headers: await this.#headers,
    });
  }

  async DeleteAdminRole(role_id: string) {
    return await this.#client.Send({
      method: "DELETE",
      url: "/api/v1/admin-roles/:role_id",
      params: { role_id },
      headers: await this.#headers,
    });
  }

  async PostRoleChannel(
    role_id: string,
    channel_id: string,
    allow_write: boolean
  ) {
    return await this.#client.Send({
      method: "POST",
      url: "/api/v1/roles/:role_id/channels",
      params: { role_id },
      body: { ChannelId: channel_id, AllowWrite: allow_write },
      headers: await this.#headers,
    });
  }

  async DeleteRoleChannel(role_id: string, channel_id: string) {
    return await this.#client.Send({
      method: "DELETE",
      url: "/api/v1/roles/:role_id/channels/:channel_id",
      params: { role_id, channel_id },
      headers: await this.#headers,
    });
  }

  async IsAdmin() {
    return (await this.#grant_manager.GetGrant()).IsAdmin;
  }
}
