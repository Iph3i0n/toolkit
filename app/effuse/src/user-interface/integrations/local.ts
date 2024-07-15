import {
  Assert,
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
      invalidates: ["/api/v1/server/metadata"],
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
      invalidates: ["/api/v1/channels"],
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
      invalidates: ["/api/v1/channels"],
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
      invalidates: ["/api/v1/banned-users"],
    });
  }

  async DeleteBannedUser(user_id: string) {
    return await this.#client.Send({
      method: "DELETE",
      url: "/api/v1/banned-users/:user_id",
      params: { user_id },
      headers: await this.#headers,
      invalidates: ["/api/v1/banned-users"],
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
      invalidates: ["/api/v1/users"],
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

  async PostRole(name: string) {
    return await this.#client.Send({
      method: "POST",
      url: "/api/v1/roles",
      body: { Name: name },
      headers: await this.#headers,
      invalidates: [
        "/api/v1/roles",
        ["/api/v1/roles", { with_permissions: "true" }],
      ],
    });
  }

  async PutRole(role_id: string, name: string) {
    return await this.#client.Send({
      method: "PUT",
      url: "/api/v1/roles/:role_id",
      params: { role_id },
      body: { Name: name },
      headers: await this.#headers,
      expect: IsObject({
        RoleId: IsString,
        Name: IsString,
      }),
      invalidates: [
        "/api/v1/roles",
        ["/api/v1/roles", { with_permissions: "true" }],
      ],
    });
  }

  async PostAdminRole(role_id: string) {
    return await this.#client.Send({
      method: "POST",
      url: "/api/v1/admin-roles",
      body: { RoleId: role_id },
      headers: await this.#headers,
      invalidates: [
        "/api/v1/roles",
        ["/api/v1/roles", { with_permissions: "true" }],
      ],
    });
  }

  async DeleteAdminRole(role_id: string) {
    return await this.#client.Send({
      method: "DELETE",
      url: "/api/v1/admin-roles/:role_id",
      params: { role_id },
      headers: await this.#headers,
      invalidates: [
        "/api/v1/roles",
        ["/api/v1/roles", { with_permissions: "true" }],
      ],
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
      invalidates: [
        "/api/v1/roles",
        ["/api/v1/roles", { with_permissions: "true" }],
      ],
    });
  }

  async DeleteRoleChannel(role_id: string, channel_id: string) {
    return await this.#client.Send({
      method: "DELETE",
      url: "/api/v1/roles/:role_id/channels/:channel_id",
      params: { role_id, channel_id },
      headers: await this.#headers,
      invalidates: [
        "/api/v1/roles",
        ["/api/v1/roles", { with_permissions: "true" }],
      ],
    });
  }

  async GetInviteLink(role_id: string) {
    return await this.#client.Send({
      method: "GET",
      url: "/api/v1/invite-link",
      params: { role_id },
      headers: await this.#headers,
      expect: IsObject({ Url: IsString }),
      no_cache: true,
    });
  }

  async GetMessages(channel_id: string, offset: bigint) {
    const result = await this.#client.Send({
      method: "GET",
      url: "/api/v1/channels/:channel_id/messages",
      params: { channel_id, offset: offset.toString() },
      headers: await this.#headers,
      expect: IsArray(
        IsObject({
          Text: IsString,
          When: IsString,
          Who: IsString,
        })
      ),
      no_cache: true,
    });

    return result.map((r) => ({ ...r, When: new Date(r.When) }));
  }

  async Subscribe(
    channel_id: string,
    bind: HTMLElement,
    handler: (message: { Text: string; When: Date; Who: string }) => void
  ) {
    const grant = await this.#grant_manager.GetGrant();
    const connection = new WebSocket(
      this.#client.Url("/ws/chat/:channel_id", {
        channel_id,
        token: grant.LocalToken,
      })
    );

    connection.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      Assert(
        IsObject({
          Text: IsString,
          Type: IsLiteral("Message"),
          When: IsString,
          Who: IsString,
        }),
        data
      );

      handler({ ...data, When: new Date(data.When) });

      if (!bind.parentElement) connection.close();
    };

    return () => connection.close();
  }

  async GetChannelUsers(channel_id: string) {
    return await this.#client.Send({
      method: "GET",
      url: "/api/v1/channels/:channel_id/users",
      params: { channel_id },
      headers: await this.#headers,
      expect: IsArray(
        IsObject({
          UserId: IsString,
          MayRead: IsBoolean,
          MayWrite: IsBoolean,
        })
      ),
    });
  }

  async PostMessage(channel_id: string, text: string) {
    return this.#client.Send({
      method: "POST",
      url: "/api/v1/channels/:channel_id/messages",
      params: { channel_id },
      headers: await this.#headers,
      body: { Text: text },
      invalidates: [],
    });
  }

  async GetTopics(channel_id: string) {
    return this.#client.Send({
      method: "GET",
      url: "/api/v1/channels/:channel_id/topics",
      params: { channel_id },
      headers: await this.#headers,
      expect: IsArray(
        IsObject({
          Id: IsString,
          Pinned: IsBoolean,
          When: IsString,
          Title: IsString,
        })
      ),
    });
  }

  async PostTopic(
    channel_id: string,
    title: string,
    text: string,
    pinned: boolean
  ) {
    return this.#client.Send({
      method: "POST",
      url: "/api/v1/channels/:channel_id/topics",
      params: { channel_id },
      headers: await this.#headers,
      body: { title, text, pinned },
      expect: IsObject({
        Id: IsString,
        Title: IsString,
        Text: IsString,
        Who: IsString,
        Created: IsString,
        Updated: IsString,
        Responses: IsArray(IsString),
      }),
      invalidates: [["/api/v1/channels/:channel_id/topics", { channel_id }]],
    });
  }

  async GetTopic(channel_id: string, topic_id: string) {
    return this.#client.Send({
      method: "GET",
      url: "/api/v1/channels/:channel_id/topics/:topic_id",
      params: { channel_id, topic_id },
      headers: await this.#headers,
      expect: IsObject({
        Id: IsString,
        Title: IsString,
        Text: IsString,
        Who: IsString,
        Created: IsString,
        Updated: IsString,
        Responses: IsArray(IsString),
      }),
    });
  }

  async PutTopic(
    channel_id: string,
    topic_id: string,
    title: string,
    text: string,
    pinned: boolean
  ) {
    return this.#client.Send({
      method: "PUT",
      url: "/api/v1/channels/:channel_id/topics/:topic_id",
      params: { channel_id, topic_id },
      headers: await this.#headers,
      body: { title, text, pinned },
      expect: IsObject({
        Id: IsString,
        Title: IsString,
        Text: IsString,
        Who: IsString,
        Created: IsString,
        Updated: IsString,
        Responses: IsArray(IsString),
      }),
      invalidates: [
        ["/api/v1/channels/:channel_id/topics", { channel_id }],
        [
          "/api/v1/channels/:channel_id/topics/:topic_id",
          { channel_id, topic_id },
        ],
      ],
    });
  }

  async GetTopicResponse(
    channel_id: string,
    topic_id: string,
    response_id: string
  ) {
    return this.#client.Send({
      method: "GET",
      url: "/api/v1/channels/:channel_id/topics/:topic_id/responses/:response_id",
      params: { channel_id, topic_id, response_id },
      headers: await this.#headers,
      expect: IsObject({
        Id: IsString,
        Text: IsString,
        Who: IsString,
        When: IsString,
      }),
    });
  }

  async PostTopicResponse(channel_id: string, topic_id: string, text: string) {
    return this.#client.Send({
      method: "POST",
      url: "/api/v1/channels/:channel_id/topics/:topic_id/responses",
      params: { channel_id, topic_id },
      headers: await this.#headers,
      body: { text },
      expect: IsObject({
        Id: IsString,
        Text: IsString,
        Who: IsString,
        When: IsString,
      }),
      invalidates: [
        [
          "/api/v1/channels/:channel_id/topics/:topic_id",
          { channel_id, topic_id },
        ],
      ],
    });
  }

  async PutTopicResponse(
    channel_id: string,
    topic_id: string,
    response_id: string,
    text: string
  ) {
    return this.#client.Send({
      method: "POST",
      url: "/api/v1/channels/:channel_id/topics/:topic_id/responses/:response_id",
      params: { channel_id, topic_id, response_id },
      headers: await this.#headers,
      body: { text },
      expect: IsObject({
        Id: IsString,
        Text: IsString,
        Who: IsString,
        When: IsString,
      }),
      invalidates: [
        [
          "/api/v1/channels/:channel_id/topics/:topic_id",
          { channel_id, topic_id },
        ],
        [
          "/api/v1/channels/:channel_id/topics/:topic_id/responses/:response_id",
          { channel_id, topic_id, response_id },
        ],
      ],
    });
  }

  async IsAdmin() {
    return (await this.#grant_manager.GetGrant()).IsAdmin;
  }
}
