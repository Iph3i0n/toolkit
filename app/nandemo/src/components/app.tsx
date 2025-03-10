import { useCallback, useState } from "preact/hooks";
import { EntityDisplay, EntityForm, EntityName } from "./entity";
import { UseFetch } from "ui-utils/use-fetch";
import { DeleteEntity, GetEntities, GetEntity } from "api-client";

const crumbs = [
  undefined,
  ...window.location.pathname
    .split("/")
    .filter((r) => r)
    .map((i) => parseInt(i)),
];

export const App = () => {
  const current_id = crumbs[crumbs.length - 1];
  const [entities, , , reset] = UseFetch(
    crumbs[crumbs.length - 1],
    GetEntities
  );

  const [current, , , edited] = UseFetch(current_id, async (id) =>
    id ? await GetEntity(id) : undefined
  );

  const [adding, set_adding] = useState(false);
  const [editing, set_editing] = useState(undefined as number | undefined);

  const finished = useCallback(() => {
    set_editing(undefined);
    set_adding(false);
    reset();
    edited();
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
          {current ? (
            <>
              {current.img && (
                <l-col xs="12" md="3">
                  <d-panel
                    colour="surface"
                    bordered
                    style={{ overflow: "hidden", fontSize: 0 }}
                  >
                    <img
                      src={current.img}
                      style={{
                        width: "100%",
                      }}
                    />
                  </d-panel>
                </l-col>
              )}
              <l-col xs="12" md={current.img ? "9" : "12"}>
                <t-routeable
                  href={current.url ?? "#"}
                  target="_blank"
                  no-transform
                >
                  <t-heading level="h3">{current.name}</t-heading>
                  <t-richtext use={{ html: current?.comment ?? "" }} />
                  <t-link href={current.url ?? "#"} target="_blank">
                    Access
                  </t-link>
                </t-routeable>
              </l-col>
              <l-col xs="12">
                {current.category && (
                  <t-paragraph>
                    Category:{" "}
                    <t-link href={`/categories/${current.category.id}`}>
                      {current.category?.name}
                    </t-link>
                  </t-paragraph>
                )}
                {!!current.tags?.length && (
                  <t-paragraph>
                    Tags:{" "}
                    {current.tags.map((t) => (
                      <t-link
                        style={{ marginLeft: "0.5rem" }}
                        href={`/categories/${t.id}`}
                      >
                        {t.name}
                      </t-link>
                    ))}
                  </t-paragraph>
                )}
              </l-col>
              <l-col xs="12">
                <d-panel colour="surface" bordered>
                  <l-row>
                    <l-col xs="12">
                      <f-button
                        type="button"
                        onClick={() => set_editing(current.id)}
                      >
                        Edit
                      </f-button>
                      <f-button
                        type="button"
                        colour="warning"
                        onClick={async () => {
                          if (!confirm("Are you sure? This cannot be undone."))
                            return;

                          await DeleteEntity(current.id);

                          if (crumbs.length <= 1) window.location.href = "/";
                          window.location.href = [
                            "",
                            ...crumbs.slice(0, crumbs.length - 1),
                          ].join("/");
                        }}
                      >
                        Delete
                      </f-button>
                    </l-col>
                  </l-row>
                </d-panel>
              </l-col>
            </>
          ) : undefined}
          {entities?.map((e) => (
            <l-col xs="12" md="3" lg="2" xl="1" key={e}>
              <EntityDisplay id={e} url_start={crumbs.join("/")} />
            </l-col>
          ))}
          <l-col xs="12" md="3" lg="2" xl="1">
            <t-routeable onClick={() => set_adding(true)}>
              <d-panel bordered colour="primary" style={{ overflow: "hidden" }}>
                <div style={{ textAlign: "center" }}>
                  <img
                    src="/_/file-add.svg"
                    style={{
                      maxHeight: "10rem",
                      width: "100%",
                      objectFit: "cover",
                      padding: "1rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <l-row>
                  <l-col xs="12">
                    <t-paragraph style={{ textAlign: "center" }}>+</t-paragraph>
                  </l-col>
                </l-row>
              </d-panel>
            </t-routeable>
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
          id={crumbs[crumbs.length - 2]}
          updating={editing}
          close={finished}
        />
      </o-modal>
    </>
  );
};
