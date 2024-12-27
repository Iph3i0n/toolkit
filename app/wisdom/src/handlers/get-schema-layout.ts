import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { Handler } from "server";

export default class GetLayouts extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/schema/layouts/:id";

  async #get_data(id: string) {
    const data = await this.get_layout(id);
    return {
      properties: data.Metadata.Attr.map((a) => ({
        name: a.Name,
        type: a.Type,
      })),
      slots: data.Metadata.Slots.map((s) => ({ name: s.Name })),
    };
  }

  async Process(request: PureRequest) {
    return new JsonResponse(
      "Ok",
      await this.#get_data(request.Parameters({ id: IsString }).id)
    );
  }
}
