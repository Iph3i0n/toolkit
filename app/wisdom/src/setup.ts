import { i_schema_repository } from "bootstrap/integrations/i-schema-repository";
import { Database } from "state";
import { v4 as Guid } from "uuid";

export async function SetupData() {
  const existing = Database.Model.pages.home;
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
