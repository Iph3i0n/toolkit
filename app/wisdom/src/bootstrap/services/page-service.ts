import c from "bootstrap/core";
import { n_state } from "bootstrap/integrations/state";
import PageService from "services/page-service";

export const n_page_service = c(() => new PageService(n_state()));
