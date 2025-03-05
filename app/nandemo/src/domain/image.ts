import { Assert, IsNumber, IsObject, IsString } from "@ipheion/safe-type";
import Databaseable from "./databaseable";
import { v4 as Guid } from "uuid";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import Env from "env";
import Path from "path";

const ImageModel = IsObject({
  id: IsNumber,
  disk_name: IsString,
  mime_type: IsString,
  original_url: IsString,
});

export default class Image extends Databaseable {
  readonly #id: number;
  #disk_name: string;
  #mime_type: string;
  #original_url: string;

  constructor(id: number);
  constructor(data: Buffer, mime_type: string, original_url: string);
  constructor(
    ...args:
      | [id: number]
      | [data: Buffer, mime_type: string, original_url: string]
  ) {
    super();

    if (typeof args[0] === "number") {
      const [id] = args;
      const match = this.get`SELECT * FROM images WHERE id = ${id} LIMIT 1`;
      Assert(ImageModel, match);
      this.#id = match.id;
      this.#disk_name = match.disk_name;
      this.#mime_type = match.mime_type;
      this.#original_url = match.original_url;
    } else {
      const [data, mime_type, original_url] = args;
      const disk_name = Guid();

      try {
        mkdirSync(Path.resolve(Env.Get("IMAGES_LOCATION")), {
          recursive: true,
        });
      } catch {}

      writeFileSync(Path.resolve(Env.Get("IMAGES_LOCATION"), disk_name), data);
      const row_id = this.exec`
        INSERT INTO images (disk_name, mime_type, original_url)
        VALUES (${disk_name}, ${mime_type ?? ""}, ${original_url ?? ""})
      `;

      Assert(IsNumber, row_id);
      this.#id = row_id;
      this.#disk_name = disk_name;
      this.#mime_type = mime_type ?? "";
      this.#original_url = original_url ?? "";
    }
  }

  get Id() {
    return this.#id;
  }

  get MimeType() {
    return this.#mime_type;
  }

  get DiskPath() {
    return Path.resolve(Env.Get("IMAGES_LOCATION"), this.#disk_name);
  }

  get Data() {
    return readFileSync(this.DiskPath);
  }

  get OriginalUrl() {
    return this.#original_url;
  }
}
