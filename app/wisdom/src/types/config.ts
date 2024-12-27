import { IsArray, IsObject, IsString } from "@ipheion/safe-type";

export const IsPublics = IsArray(
  IsObject({
    at: IsString,
    prefix: IsString,
  })
);

export const IsConfig = IsObject({
  layouts: IsString,
  blocks: IsString,
  components: IsString,
  publics: IsPublics,
});
