import { useCallback, useState } from "preact/hooks";
import { EntityDisplay, EntityForm, EntityName } from "./entity";
import { UseFetch } from "ui-utils/use-fetch";
import { GetEntities } from "api-client";

const crumbs = [
  undefined,
  ...window.location.pathname
    .split("/")
    .filter((r) => r)
    .map((i) => parseInt(i)),
];

export const App = () => {
  const [entities, , , reset] = UseFetch(
    crumbs[crumbs.length - 1],
    GetEntities
  );

  const [adding, set_adding] = useState(false);
  const [editing, set_editing] = useState(undefined as number | undefined);

  const finished = useCallback(() => {
    set_editing(undefined);
    set_adding(false);
    reset();
  }, [set_adding, reset]);

  return (
    <>
      <l-container>
        <l-row>
          <l-col xs="12">
            <t-paragraph>
              {crumbs.map((c, i) => (
                <>
                  {typeof c === "number" ? (
                    <t-link
                      href={crumbs.slice(0, crumbs.indexOf(c) + 1).join("/")}
                    >
                      <EntityName id={c} />
                    </t-link>
                  ) : (
                    <t-link href="/">Home</t-link>
                  )}
                  {i < crumbs.length - 1 ? " / " : ""}
                </>
              ))}
            </t-paragraph>
          </l-col>
        </l-row>
      </l-container>
      <l-container>
        <l-row>
          {entities?.map((e) => (
            <l-col xs="12" key={e}>
              <EntityDisplay
                id={e}
                on_edit={() => set_editing(e)}
                url_start={crumbs.join("/")}
              />
            </l-col>
          ))}
        </l-row>
      </l-container>
      <l-container>
        <l-row>
          <l-col xs="12">
            <f-button type="button" onClick={() => set_adding(true)}>
              +
            </f-button>
          </l-col>
        </l-row>
      </l-container>
      <o-modal
        size="large"
        open={adding || typeof editing !== "undefined"}
        onCloseRequested={() => {
          set_editing(undefined);
          set_adding(false);
        }}
      >
        <span slot="title">Add Entity</span>
        <EntityForm
          id={crumbs[crumbs.length - 1]}
          updating={editing}
          close={finished}
        />
      </o-modal>
    </>
  );
};
