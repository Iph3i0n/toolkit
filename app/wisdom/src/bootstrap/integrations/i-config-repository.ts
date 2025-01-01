import c from "bootstrap/core";
import ConfigRepository from "integrations/config-repository";
import IConfigRepository from "integrations/i-config-repository";

export const i_config_repository = c(
  (): IConfigRepository => new ConfigRepository()
);
