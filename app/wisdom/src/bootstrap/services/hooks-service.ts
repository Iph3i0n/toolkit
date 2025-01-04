import c from "bootstrap/core";
import { i_config_repository } from "bootstrap/integrations/i-config-repository";
import HooksService from "services/hooks-service";

export const n_hooks_service = c(() => new HooksService(i_config_repository()));
