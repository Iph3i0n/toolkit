import Url from "@ipheion/url";

export function GetJson(url: Url | string) {
  return fetch(url instanceof Url ? url.Href : url)
    .then((r) => {
      if (!r.ok) throw r;
      return r;
    })
    .then((r) => r.json());
}

export function PutJson(url: Url | string, data: unknown) {
  return fetch(url instanceof Url ? url.Href : url, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((r) => {
      if (!r.ok) throw r;
      return r;
    })
    .then((r) => r.json());
}
