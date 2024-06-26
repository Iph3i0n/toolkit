import { IHandler } from "../contracts";
import Pattern from "./pattern";

export class HandlerStore {
  private data: Array<[string, Pattern, IHandler]> = [];

  public Add(handler: IHandler) {
    this.data = [
      ...this.data,
      [handler.Method.toLowerCase(), handler.Pattern, handler],
    ];
  }

  public Get(url: URL, method: string) {
    const matches =
      this.data
        .filter(([m, p]) => m === method.toLowerCase() && p.IsMatch(url))
        .sort(([_1, p1], [_2, p2]) => p2.Score - p1.Score)[0] ?? [];
    return matches[2];
  }
}
