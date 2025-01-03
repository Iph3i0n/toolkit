import { Assert, IsObject, IsString } from "@ipheion/safe-type";
import Url from "@ipheion/url";

const auth_header = () => `Bearer ${sessionStorage.getItem("token")}`;

declare global {
  export const Router: any;
}

export function Login(username: string, password: string) {
  return fetch(new Url("/api/v1/token", { username, password }).Href)
    .then((r) => {
      if (!r.ok) throw r;
      return r;
    })
    .then((r) => r.json())
    .then((json) => {
      Assert(IsObject({ token: IsString }), json);
      sessionStorage.setItem("token", json.token);
    });
}

export function GetJson(url: Url | string) {
  return fetch(url instanceof Url ? url.Href : url, {
    headers: {
      Authorization: auth_header(),
    },
  })
    .then((r) => {
      if (r.status === 403) Router.Push("/login");
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
      Authorization: auth_header(),
    },
  })
    .then((r) => {
      if (r.status === 403) Router.Push("/login");
      if (!r.ok) throw r;
      return r;
    })
    .then((r) => r.json());
}

export function PostJson(url: Url | string, data: unknown) {
  return fetch(url instanceof Url ? url.Href : url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      Authorization: auth_header(),
    },
  })
    .then((r) => {
      if (r.status === 403) Router.Push("/login");
      if (!r.ok) throw r;
      return r;
    })
    .then((r) => r.json());
}
