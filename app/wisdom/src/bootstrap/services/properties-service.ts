import c from "bootstrap/core";
import PropertiesService from "services/properties-service";
import { n_page_service } from "./page-service";
import { n_state } from "bootstrap/integrations/state";

export const n_properties_service = c(
  () => new PropertiesService(n_page_service(), n_state())
);
