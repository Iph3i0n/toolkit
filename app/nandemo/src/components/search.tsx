import { useEffect, useState } from "preact/hooks";
import { CategorySelector } from "./categories";
import { TagSelector } from "./tags";
import { UseFetch } from "ui-utils/use-fetch";
import { GetEntities } from "api-client";
import { EntityDisplay } from "./entity";

const search = new URLSearchParams(window.location.search);

export const Search = () => {
  const [term, set_term] = useState("");
  const [tags, set_tags] = useState([] as Array<number>);
  const [category, set_category] = useState(-1);
  const [require_all_tags, set_require_all_tags] = useState("on");

  const [matches, , , reset] = UseFetch(undefined, () =>
    GetEntities(undefined, {
      category: !Number.isNaN(category) ? category : undefined,
      tags,
      require_all_tags: require_all_tags === "on",
      term: term ? term : undefined,
    })
  );

  useEffect(() => {
    reset();
  }, [
    term,
    tags.join(","),
    !Number.isNaN(category) ? category : undefined,
    require_all_tags,
  ]);

  return (
    <l-container>
      <l-row>
        <l-col xs="12" md="4" lg="3" xl="2">
          <f-form
            submit="event-only"
            onSubmitted={(e) => {
              console.log(e.FormData);
            }}
          >
            <l-row>
              <l-col xs="12">
                <f-input
                  name="term"
                  prefill=""
                  onValueChanged={(e) => set_term((e.Value as string) ?? "")}
                >
                  Search Term
                </f-input>
              </l-col>
              <CategorySelector on_change={set_category} no_create />
              <TagSelector prefill={[]} on_change={set_tags} no_create />
              <l-col xs="12">
                <f-toggle
                  name="require_all_tags"
                  prefill="on"
                  onValueChanged={(e) =>
                    set_require_all_tags(e.Value as string)
                  }
                >
                  Require all tags to be present
                  <span slot="on">Yes</span>
                  <span slot="off">No</span>
                </f-toggle>
              </l-col>
            </l-row>
          </f-form>
        </l-col>
        <l-col xs="12" md="8" lg="9" xl="10">
          <l-row>
            {matches?.map((m) => (
              <l-col key={m} xs="12">
                <EntityDisplay id={m} />
              </l-col>
            ))}
          </l-row>
        </l-col>
      </l-row>
    </l-container>
  );
};
