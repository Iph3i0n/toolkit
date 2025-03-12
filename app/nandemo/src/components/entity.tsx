import { Assert } from "@ipheion/safe-type";
import { AddEntity, GetEntities, GetEntity, UpdateEntity } from "api-client";
import { FormSubmittedEvent } from "bakery";
import { CreateEntityModel } from "models/entity";
import { useCallback, useState } from "preact/hooks";
import { UseFetch } from "ui-utils/use-fetch";
import { TagSelector } from "./tags";
import { CategorySelector } from "./categories";

type EntityFormProps = {
  id?: number;
  updating?: number;
  close: () => void;
};

export const ContainerPicker = (props: { id?: number }) => {
  const [value, set_value] = useState(props.id);

  const [current] = UseFetch(value, async (id) =>
    id ? await GetEntity(id) : undefined
  );
  const [children] = UseFetch(value, GetEntities);
  return (
    <>
      <f-hidden name="container" prefill={value?.toString() ?? ""} />
      <l-col xs="12">
        <d-panel>
          <l-row>
            <l-col xs="12">
              <t-paragraph style={{ marginTop: 0 }}>Parent</t-paragraph>
              <d-listgroup>
                {current && (
                  <t-link onClick={() => set_value(current.container?.id)}>
                    ../{current.container?.name}
                  </t-link>
                )}
                {children?.map((c) => (
                  <t-link onClick={() => set_value(c)}>
                    <EntityName id={c} />
                  </t-link>
                ))}
              </d-listgroup>
            </l-col>
          </l-row>
        </d-panel>
      </l-col>
    </>
  );
};

export const EntityForm = (props: EntityFormProps) => {
  const [data] = UseFetch(props.updating, async (i) =>
    i ? await GetEntity(i) : undefined
  );

  return (
    <f-form
      submit="event-only"
      onSubmitted={useCallback(
        (e: FormSubmittedEvent) => {
          const temp = e.FormData as any;
          const data = {
            name: temp.name,
            quantity: parseInt(temp.quantity),
            url: temp.url,
            img: temp.img,
            container: temp.container ? parseInt(temp.container) : undefined,
            category: temp.category ? parseInt(temp.category) : undefined,
            tags:
              temp.tags
                ?.split(",")
                .filter((t: string) => t.trim())
                .map((t: string) => parseInt(t.trim())) ?? [],
            comment: temp.comment,
          };
          Assert(CreateEntityModel, data);

          if (props.updating)
            UpdateEntity(props.updating, data).then(() => props.close());
          else AddEntity(data).then(() => props.close());
        },
        [props.id, props.updating]
      )}
    >
      <l-row>
        <l-col xs="12">
          <f-input name="name" prefill={data?.name} required>
            Name
          </f-input>
        </l-col>
        <ContainerPicker id={data?.container?.id ?? props.id} />
        <l-col xs="12">
          <f-numeric
            name="quantity"
            prefill={data?.quantity.toString() ?? "1"}
            decimal-places="0"
            no-negative
            required
          >
            Quantity
          </f-numeric>
        </l-col>
        <l-col xs="12">
          <f-input type="url" prefill={data?.url ?? undefined} name="url">
            URL
          </f-input>
        </l-col>
        <l-col xs="12">
          <f-input type="url" prefill={data?.img ?? undefined} name="img">
            Image URL
            <span slot="help">
              If not provided, the app will attempt to pull an image from the
              URL
            </span>
          </f-input>
        </l-col>
        <l-col xs="12">
          <f-richtext name="comment" prefill={data?.comment ?? undefined}>
            Description
          </f-richtext>
        </l-col>
        <CategorySelector prefill={data?.category?.id ?? undefined} />
        <TagSelector prefill={data?.tags?.map((t) => t.id)} />
        <l-col xs="12">
          <f-button type="submit">
            {props.updating ? "Update" : "Create"}
          </f-button>
        </l-col>
      </l-row>
    </f-form>
  );
};

type EntityDisplayProps = {
  id: number;
  url_start: string;
};

export const EntityDisplay = (props: EntityDisplayProps) => {
  const [data] = UseFetch(props.id, GetEntity);

  if (!data) return <></>;

  return (
    <t-routeable href={[props.url_start, props.id].join("/")}>
      <d-panel bordered colour="surface" style={{ overflow: "hidden" }}>
        <div style={{ textAlign: "center" }}>
          <img
            src={`/entities/${props.id}/image`}
            alt={data.name}
            style={{
              height: "10rem",
              width: "100%",
              objectFit: "cover",
            }}
          />
        </div>
        <l-row>
          <l-col xs="12">
            <t-paragraph>{data.name}</t-paragraph>
          </l-col>
        </l-row>
      </d-panel>
    </t-routeable>
  );
};

export const EntityName = (props: { id: number }) => {
  const [data] = UseFetch(props.id, GetEntity);

  return <>{data?.name ?? ""}</>;
};
