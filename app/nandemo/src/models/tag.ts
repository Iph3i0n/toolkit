import {
  IsObject,
  IsNumber,
  IsString,
  Optional,
  IsType,
  IsArray,
  Checker,
} from "@ipheion/safe-type";

export const TagModel = IsObject({
  id: IsNumber,
  name: IsString,
  parent: Optional(IsNumber),
});

export type TagModel = IsType<typeof TagModel>;

export const CreateTagModel = IsObject({
  name: IsString,
  parent: Optional(IsNumber),
});

export type CreateTagModel = IsType<typeof CreateTagModel>;

export const GetTagTreeModel: Checker<{
  id: number;
  name: string;
  children: Array<IsType<typeof GetTagTreeModel>>;
}> = IsObject({
  id: IsNumber,
  name: IsString,
  children: IsArray((arg) => GetTagTreeModel(arg)),
});

export type GetTagTreeModel = IsType<typeof GetTagTreeModel>;
