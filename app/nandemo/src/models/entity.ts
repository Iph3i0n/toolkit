import {
  IsArray,
  IsNumber,
  IsObject,
  IsString,
  IsType,
  Optional,
} from "@ipheion/safe-type";

export const EntityModel = IsObject({
  id: IsNumber,
  name: IsString,
  quantity: IsNumber,
  url: Optional(IsString),
  img: Optional(IsString),
  container: Optional(IsNumber),
  category: Optional(IsNumber),
  comment: Optional(IsString),
});

export type EntityModel = IsType<typeof EntityModel>;

export const CreateEntityModel = IsObject({
  name: IsString,
  quantity: IsString,
  url: Optional(IsString),
  img: Optional(IsString),
  container: Optional(IsNumber),
  category: Optional(IsNumber),
  tags: Optional(IsArray(IsNumber)),
  comment: Optional(IsString),
});

export type CreateEntityModel = IsType<typeof CreateEntityModel>;

export const GetEntityModel = IsObject({
  id: IsNumber,
  name: IsString,
  quantity: IsNumber,
  url: Optional(IsString),
  img: Optional(IsString),
  container: Optional(IsObject({ id: IsString, name: IsString })),
  category: Optional(IsObject({ id: IsString, name: IsString })),
  tags: Optional(IsArray(IsObject({ id: IsString, name: IsString }))),
  comment: Optional(IsString),
});

export type GetEntityModel = IsType<typeof EntityModel>;
