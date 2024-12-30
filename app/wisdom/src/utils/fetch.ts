import Url from "@ipheion/url";

export function GetJson(url: Url | string) {
  return fetch(url instanceof Url ? url.Href : url)
    .then((r) => {
      if (!r.ok) throw r;
      return r;
    })
    .then((r) => r.json());
}
