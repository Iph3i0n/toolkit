import { HttpMethod } from "@ipheion/puristee";
import { Handler } from "local/server";

export default class PostTopic extends Handler {
  readonly Method = HttpMethod.Post;
  readonly Url = "/api/v1/channels/:channel_id/topics";
}
