import {
  Assert,
  IsArray,
  IsBoolean,
  IsObject,
  IsString,
} from "@ipheion/safe-type";
import { UserGrant } from "../models/user-grant";
import { Url } from "../utils/url";
import { ClientBase } from "./base";
import { ServerGrant } from "../models/server-grant";
import { Channel } from "../models/channel";
import { Role } from "../models/role";

export class SsoClient extends ClientBase {
  constructor() {
    super({ baseURL: process.env.LOCAL_BASE });
  }

  async GetAllBannedUsers(grant: ServerGrant) {
    const { data } = await this.get(Url("/api/v1/banned-users"), {
      headers: grant.LocalHeaders,
    });

    Assert(IsArray(IsObject({ UserId: IsString })), data);

    return data;
  }

  async GetAllChannels(grant: ServerGrant): Promise<Array<Channel>> {
    const { data } = await this.get(Url("/api/v1/channels"), {
      headers: grant.LocalHeaders,
    });

    Assert(IsArray(Channel), data);
    return data;
  }

  async GetAllRoles(grant: ServerGrant): Promise<Array<Role>> {
    const { data } = await this.get(Url("/api/v1/channels"), {
      headers: grant.LocalHeaders,
    });

    Assert(IsArray(Role), data);
    return data;
  }

  async GetAuthToken(grant: UserGrant): Promise<ServerGrant> {
    const { data } = await this.get(
      Url("/api/v1/auth/token", {
        token: grant.ServerToken,
      })
    );

    Assert(
      IsObject({
        LocalToken: IsString,
        IsAdmin: IsBoolean,
        Expires: IsString,
        UserId: IsString,
      }),
      data
    );

    return {
      LocalHeaders: {
        Authorization: `Bearer ${data.LocalToken}`,
      },
      IsAdmin: data.IsAdmin,
      UserId: data.UserId,
      Expires: new Date(data.Expires),
    };
  }
}
