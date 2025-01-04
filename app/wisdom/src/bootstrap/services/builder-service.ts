import c from "bootstrap/core";
import BuilderService from "services/builder-service";
import { n_page_service } from "./page-service";
import { i_schema_repository } from "bootstrap/integrations/i-schema-repository";
import { i_config_repository } from "bootstrap/integrations/i-config-repository";
import { n_state } from "bootstrap/integrations/state";
import { n_hooks_service } from "./hooks-service";

export const n_builder_service = c(
  () =>
    new BuilderService(
      n_page_service(),
      i_schema_repository(),
      i_config_repository(),
      n_state(),
      n_hooks_service()
    )
);
