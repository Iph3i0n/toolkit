import { HttpMethod, PureRequest } from "@ipheion/puristee";
import { IsString } from "@ipheion/safe-type";
import { EjsResponse } from "response";
import { Handler } from "server";

export default class Home extends Handler {
  readonly Method = HttpMethod.Get;
  readonly Url = "/blog/:article";

  async Process(request: PureRequest) {
    const { article } = request.Parameters({ article: IsString });
    return new EjsResponse("article", {
      uitext: await this.Entry("blogs", article),
    });
  }
}
