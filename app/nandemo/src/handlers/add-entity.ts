import Category from "domain/category";
import Entity from "domain/entity";
import Tag from "domain/tag";
import { Handler, IHandler } from "handler";
import { CreateEntityModel } from "models/entity";
import Request from "request";
import { JsonResponse } from "response";
import Ogs from "open-graph-scraper";
import Axios from "axios";
import Image from "domain/image";

@Handler("/entities", "post")
export default class Controller implements IHandler {
  async #save_image(url: string) {
    const result = await Axios.get(url, {
      responseType: "arraybuffer",
    });

    let mime = result.headers["Content-Type"];
    if (typeof mime !== "string") mime = "image/png";
    else mime = mime.split(";")[0].trim();

    return new Image(Buffer.from(result.data), mime, url);
  }

  async #meta_image(url: string) {
    const data = await Ogs({ url });
    const [image] = data.result.ogImage ?? [];
    if (!image) return undefined;

    return await this.#save_image(image.url);
  }

  async Handle(request: Request) {
    const data = request.Body(CreateEntityModel);

    let img: Image | undefined;
    try {
      img = data.img
        ? await this.#save_image(data.img)
        : data.url
        ? await this.#meta_image(data.url)
        : undefined;
    } catch (err) {
      console.error(err);
    }

    const created = new Entity(
      data.name,
      data.quantity,
      data.url ?? undefined,
      img,
      data.container ? new Entity(data.container) : undefined,
      data.category ? new Category(data.category) : undefined,
      data.tags?.map((t) => new Tag(t)) ?? [],
      data.comment ?? undefined
    );

    return new JsonResponse(201, { created: true, id: created.Id });
  }
}
