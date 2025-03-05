import {
  IsObject,
  IsNumber,
  IsString,
  Optional,
  IsType,
  IsArray,
  Checker,
} from "@ipheion/safe-type";

export const CategoryModel = IsObject({
  id: IsNumber,
  name: IsString,
  parent: Optional(IsNumber),
});

export type CategoryModel = IsType<typeof CategoryModel>;

export const CreateCategoryModel = IsObject({
  name: IsString,
  parent: Optional(IsNumber),
});

export type CreateCategoryModel = IsType<typeof CreateCategoryModel>;

export const GetCategoryTreeModel: Checker<{
  id: number;
  name: string;
  children: Array<IsType<typeof GetCategoryTreeModel>>;
}> = IsObject({
  id: IsNumber,
  name: IsString,
  children: IsArray((arg) => GetCategoryTreeModel(arg)),
});

export type GetCategoryTreeModel = IsType<typeof GetCategoryTreeModel>;
