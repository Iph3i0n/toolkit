import { HttpMethod, JsonResponse, PureRequest } from "@ipheion/puristee";
import { Handler } from "local/server";

export default class GetMetadata extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/api/v1/server/metadata";

  async Process(request: PureRequest) {
    const data = this.State.server_metadata["default"];

    if (!data)
      return new JsonResponse("Ok", {
        ServerName: "Unnamed Server",
        Icon: {
          Base64Data: "",
          MimeType: "image/png",
        },
      });

    return new JsonResponse("Ok", {
      ServerName: data.name,
      Icon: {
        Base64Data: Buffer.from(data.icon).toString("base64"),
        MimeType: "image/png",
      },
    });
  }
}
