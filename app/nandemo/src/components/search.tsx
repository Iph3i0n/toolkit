import { CategorySelector } from "./categories";
import { TagSelector } from "./tags";

const search = new URLSearchParams(window.location.search);

export const Search = () => {
  const term = search.get("term");
  const tags = search.get("tags");
  const require_all_tags = search.get("require_all_tags");
  const category = search.get("category");

  return (
    <l-container>
      <f-form
        submit="event-only"
        onSubmitted={(e) => {
          console.log(e.FormData);
        }}
      >
        <l-row>
          <l-col xs="12">
            <f-input name="term" prefill={term ?? ""}>
              Search Term
            </f-input>
          </l-col>
          <CategorySelector
            prefill={category ? parseInt(category) : undefined}
            no_create
          />
          <TagSelector
            prefill={tags
              ?.split(",")
              .filter((t) => t.trim())
              .map((t) => parseInt(t.trim()))}
            no_create
          />
          <l-col xs="12">
            <f-toggle
              name="require_all_tags"
              prefill={require_all_tags === "true" ? "on" : "off"}
            >
              Require all tags to be present
              <span slot="on">Yes</span>
              <span slot="off">No</span>
            </f-toggle>
          </l-col>
          <l-col xs="12">
            <f-button colour="primary" type="submit">
              <t-icon name="search" colour="primary" text />
            </f-button>
          </l-col>
        </l-row>
      </f-form>
    </l-container>
  );
};
