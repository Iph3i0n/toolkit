import { useCallback, useState } from "preact/hooks";
import {
  Breadcrumbs,
  ContainerPicker,
  EntityDisplay,
  EntityForm,
} from "./entity";
import { UseFetch } from "ui-utils/use-fetch";
import { DeleteEntity, GetEntities, GetEntity, UpdateEntity } from "api-client";

export const App = (props: { path: Array<string> }) => {
  const current_id = isNaN(props.path[0] as any)
    ? undefined
    : parseInt(props.path[0] ?? "");
  const [entities, , , reset] = UseFetch(current_id, GetEntities);

  const [current, , , edited] = UseFetch(current_id, async (id) =>
    id ? await GetEntity(id) : undefined
  );

  const [adding, set_adding] = useState(false);
  const [editing, set_editing] = useState(undefined as number | undefined);
  const [bulk_moving, set_bulk_moving] = useState(false);

  const reset_all = () => {
    reset();
    edited();
  };

  const finished = useCallback(() => {
    set_editing(undefined);
    set_adding(false);
    reset_all();
  }, [set_adding, reset, reset]);

  return (
    <>
      <l-container>
        <l-row>
          <l-col xs="12">
            <Breadcrumbs id={current_id} />
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

                          if (typeof current_id === "undefined")
                            window.location.href = "/";
                          window.location.href = [
                            "",
                            "items",
                            current.container?.id,
                          ].join("/");
                        }}
                      >
                        Delete
                      </f-button>
                      <f-button
                        type="button"
                        colour="contrast"
                        onClick={() => set_bulk_moving(true)}
                      >
                        Bulk Move
                      </f-button>
                    </l-col>
                  </l-row>
                </d-panel>
              </l-col>
            </>
          ) : undefined}
          {entities?.map((e) => (
            <l-col xs="12" md="3" lg="2" xl="1" key={e}>
              <EntityDisplay id={e} />
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
          id={
            typeof editing !== "undefined"
              ? current?.container?.id
              : current?.id
          }
          updating={editing}
          close={finished}
        />
      </o-modal>
      <o-modal
        open={bulk_moving}
        onCloseRequested={() => {
          set_bulk_moving(false);
        }}
      >
        <span slot="title">Bulk Move</span>
        <f-form
          submit="event-only"
          onSubmitted={async (e) => {
            set_bulk_moving(false);
            const temp = e.FormData as any;
            const target = parseInt(temp.container ?? "");
            if (typeof target !== "number" || isNaN(target)) return;

            await Promise.all(
              entities?.map(async (part) => {
                const data = await GetEntity(part);
                await UpdateEntity(part, {
                  name: data.name,
                  quantity: data.quantity,
                  url: data.url,
                  img: data.img,
                  container: target,
                  category: data.category?.id,
                  tags: data.tags?.map((t) => t.id),
                  comment: data.comment,
                });
              }) ?? []
            );

            reset_all();
          }}
        >
          <l-row>
            <ContainerPicker id={current_id} />
            <l-col xs="12">
              <f-button type="submit">Move</f-button>
            </l-col>
          </l-row>
        </f-form>
      </o-modal>
    </>
  );
};
