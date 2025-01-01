import { i_schema_repository } from "bootstrap/integrations/i-schema-repository";
import { n_page_service } from "bootstrap/services/page-service";
import { Database } from "state";
import { v4 as Guid } from "uuid";

export async function SetupData() {
  const page_service = n_page_service();
  const existing = page_service.HomePage;

  if (existing) {
    console.log("Looks like the app has already been set up. Stopping here.");
    return;
  }

  const schema_repository = i_schema_repository();
  const [layout] = await schema_repository.get_layouts();
  if (!layout)
    throw new Error(
      "Could not find a layout for the home page. Please make sure you have at least one ready. The home page layout may be changed after setup."
    );
  Database.Write({
    pages: {
      [Guid()]: {
        slug: "home",
        layout,
        parent: null,
        properties: {},
        slots: {},
      },
    },
  });
}
