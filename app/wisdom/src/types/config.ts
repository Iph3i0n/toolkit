import {
  IsArray,
  IsObject,
  IsString,
  IsType,
  Optional,
} from "@ipheion/safe-type";

export const Publics = IsArray(
  IsObject({
    at: IsString,
    prefix: IsString,
  })
);

export const Property = IsObject({
  label: IsString,
  name: IsString,
  type: IsString,
  options: Optional(IsArray(IsString)),
});

export const Config = IsObject({
  layouts: IsString,
  blocks: IsString,
  components: IsString,
  publics: Publics,
  dist_dir: IsString,
  preview_url: IsString,
  hooks_dir: IsString,
  properties: IsArray(Property),
});

export type Config = IsType<typeof Config>;
