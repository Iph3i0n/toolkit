import { n_builder_service } from "bootstrap/services/builder-service";

export async function BuildApp() {
  await n_builder_service().BuildApp();
}
