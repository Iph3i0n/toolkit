import c from "bootstrap/core";
import ISchemaRepository from "integrations/i-schema-repository";
import SchemaRepository from "integrations/schema-repository";

export const i_schema_repository = c(
  (): ISchemaRepository => new SchemaRepository()
);
