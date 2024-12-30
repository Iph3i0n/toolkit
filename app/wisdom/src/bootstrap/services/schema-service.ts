import c from "bootstrap/core";
import { i_schema_repository } from "bootstrap/integrations/i-schema-repository";
import SchemaService from "services/schema-service";

export const n_schema_service = c(() => new SchemaService(i_schema_repository()));
