export function GetJson(url: string) {
  return fetch(url)
    .then((r) => {
      if (!r.ok) throw r;
      return r;
    })
    .then((r) => r.json());
}
