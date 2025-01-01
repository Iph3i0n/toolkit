import c from "bootstrap/core";
import ISchemaRepository from "integrations/i-schema-repository";
import SchemaRepository from "integrations/schema-repository";
import { i_config_repository } from "./i-config-repository";

export const i_schema_repository = c(
  (): ISchemaRepository => new SchemaRepository(i_config_repository())
);
