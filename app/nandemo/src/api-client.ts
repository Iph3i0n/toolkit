import { Assert, IsArray, IsNumber, IsObject } from "@ipheion/safe-type";
import { CreateCategoryModel, GetCategoryTreeModel } from "models/category";
import { CreateEntityModel, GetEntityModel } from "models/entity";
import { CreateTagModel, GetTagTreeModel } from "models/tag";

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

export async function UpdateEntity(id: number, model: CreateEntityModel) {
  await fetch(`/entities/${id}`, {
    method: "PUT",
    credentials: "same-origin",
    body: JSON.stringify(model),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

type GetEntitiesProps = {
  category?: number;
  tags?: Array<number>;
  require_all_tags?: boolean;
  term?: string;
};

export async function GetEntities(parent?: number, props?: GetEntitiesProps) {
  const url = new URL(parent ? `/entities/${parent}/children` : "/entities");
  if (props) {
    if (typeof props.category !== "undefined")
      url.searchParams.set("category", props.category.toString());
    if (typeof props.tags !== "undefined")
      url.searchParams.set("category", props.tags.join(","));
    if (typeof props.require_all_tags !== "undefined" && props.require_all_tags)
      url.searchParams.set("require_all_tags", "true");
    if (typeof props.term !== "undefined")
      url.searchParams.set("term", props.term.toString());
  }

  const result = await fetch(url, {
    method: "GET",
    credentials: "same-origin",
    headers: {},
  });

  const body = await result.json();

  Assert(IsArray(IsNumber), body);
  return body;
}

export async function GetBreadcrumbs(parent?: number) {
  const result = await fetch(
    parent ? `/entities/${parent}/breadcrumbs` : "/entities",
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

export async function DeleteEntity(id: number) {
  await fetch(`/entities/${id}`, {
    method: "DELETE",
    credentials: "same-origin",
    headers: {},
  });
}

export async function GetTagTree() {
  const result = await fetch(`/tags`, {
    method: "GET",
    credentials: "same-origin",
    headers: {},
  });

  const body = await result.json();

  Assert(IsArray(GetTagTreeModel), body);
  return body;
}

export async function AddTag(model: CreateTagModel) {
  const result = await fetch("/tags", {
    method: "POST",
    credentials: "same-origin",
    body: JSON.stringify(model),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body = await result.json();

  Assert(IsObject({ id: IsNumber }), body);
  return body;
}

export async function GetCategoryTree() {
  const result = await fetch(`/categories`, {
    method: "GET",
    credentials: "same-origin",
    headers: {},
  });

  const body = await result.json();

  Assert(IsArray(GetCategoryTreeModel), body);
  return body;
}

export async function AddCategory(model: CreateCategoryModel) {
  const result = await fetch("/categories", {
    method: "POST",
    credentials: "same-origin",
    body: JSON.stringify(model),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const body = await result.json();

  Assert(IsObject({ id: IsNumber }), body);
  return body;
}
