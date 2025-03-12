import Category from "domain/category";
import Entity from "domain/entity";
import Tag from "domain/tag";
import { Handler, IHandler } from "handler";
import { CreateEntityModel } from "models/entity";
import Request from "request";
import { EmptyResponse, JsonResponse } from "response";
import Ogs from "open-graph-scraper";
import Axios from "axios";
import Image from "domain/image";

@Handler("/entities/:id", "put")
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

  async #meta_data(url: string) {
    const data = await Ogs({ url });
    const [image] = data.result.ogImage ?? [];
    if (!image) return undefined;

    return {
      img: await this.#save_image(image.url),
      description: data.result.ogDescription,
    };
  }

  async Handle(request: Request) {
    const id = request.Param("id");
    if (!id) return new EmptyResponse(404);

    const data = request.Body(CreateEntityModel);

    try {
      const result = new Entity(parseInt(id));
      if (data.url && data.url !== result.Url) {
        try {
          const metadata = await this.#meta_data(data.url);
          if (!data.img) result.Img = metadata?.img;
          if (!data.comment) result.Comment = metadata?.description;
        } catch (err) {
          console.error(err);
        }
      }

      result.Name = data.name;
      result.Quantity = data.quantity;
      result.Url = data.url ?? undefined;
      if (data.img !== result.Img?.OriginalUrl && data.img) {
        try {
          result.Img = data.img ? await this.#save_image(data.img) : undefined;
        } catch (err) {
          console.error(err);
        }
      }

      result.Container = data.container
        ? new Entity(data.container)
        : undefined;
      result.Category = data.category ? new Category(data.category) : undefined;
      result.Tags = data.tags?.map((t) => new Tag(t)) ?? [];
      result.Comment = data.comment ?? undefined;

      return new JsonResponse(200, {
        updated: true,
      });
    } catch (err) {
      console.error(err);
      return new EmptyResponse(404);
    }
  }
}
