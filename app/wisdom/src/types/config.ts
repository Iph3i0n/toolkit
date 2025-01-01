import { IsArray, IsObject, IsString, IsType } from "@ipheion/safe-type";

export const Publics = IsArray(
  IsObject({
    at: IsString,
    prefix: IsString,
  })
);

export const Config = IsObject({
  layouts: IsString,
  blocks: IsString,
  components: IsString,
  publics: Publics,
  dist_dir: IsString,
});

export type Config = IsType<typeof Config>;