import { DoNotCare, IsArray, IsObject, IsString } from "@ipheion/safe-type";
import { ApiClient } from "./api-client";
import { GrantManager } from "./grant-manager";
import { ServerGrant } from "user-interface/models/server-grant";
import { TransformFile } from "./file";

export class LocalClient {
  readonly #grant_manager: GrantManager<ServerGrant>;
  readonly #client: ApiClient;

  constructor(base_url: string, grant_manager: GrantManager<ServerGrant>) {
    this.#grant_manager = grant_manager;
    this.#client = new ApiClient(base_url);
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

  async IsAdmin() {
    return (await this.#grant_manager.GetGrant()).IsAdmin;
  }
}
