import { Assert, IsArray, IsNumber } from "@ipheion/safe-type";
import { CreateEntityModel, GetEntityModel } from "models/entity";

export async function AddEntity(model: CreateEntityModel) {
  await fetch("/entities", {
    method: "POST",
    credentials: "same-origin",
    body: JSON.stringify(model),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function GetEntities(parent?: number) {
  const result = await fetch(
    parent ? `/entities/${parent}/children` : "/entities",
    {
      method: "GET",
      credentials: "same-origin",
      headers: {},
    }
  );

  const body = await result.json();

  Assert(IsArray(IsNumber), body);
  return body;
}

export async function GetEntity(id: number) {
  const result = await fetch(`/entities/${id}`, {
    method: "GET",
    credentials: "same-origin",
    headers: {},
  });

  const body = await result.json();

  Assert(GetEntityModel, body);
  return body;
}
