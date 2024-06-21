import Fs from "node:fs/promises";
import Path from "path";
import { User } from "$sso/m/user";
import { IProfilePicture } from "./i-profile-picture";
import { DataDir } from "$sso/server";

export class FsProfilePicture implements IProfilePicture {
  get #dir() {
    return Path.resolve(DataDir, "pictures");
  }

  async SavePicture(
    user_id: string,
    mime: string,
    data: string
  ): Promise<void> {
    const buffer = Buffer.from(data, "base64");
    await Fs.writeFile(Path.resolve(this.#dir, `${user_id}.mime`), mime);
    await Fs.writeFile(Path.resolve(this.#dir, `${user_id}.image`), buffer);
  }

  async GetPicture(user_id: string): Promise<[string, Buffer] | undefined> {
    try {
      return [
        await Fs.readFile(Path.resolve(this.#dir, `${user_id}.mime`), "utf-8"),
        await Fs.readFile(Path.resolve(this.#dir, `${user_id}.image`)),
      ];
    } catch {
      return undefined;
    }
  }
}
