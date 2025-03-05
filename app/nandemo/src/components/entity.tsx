import { Assert } from "@ipheion/safe-type";
import { AddEntity, GetEntity, UpdateEntity } from "api-client";
import { FormSubmittedEvent } from "bakery";
import { CreateEntityModel } from "models/entity";
import { useCallback } from "preact/hooks";
import { UseFetch } from "ui-utils/use-fetch";
import { TagSelector } from "./tags";
import { CategorySelector } from "./categories";

type EntityFormProps = {
  id?: number;
  updating?: number;
  close: () => void;
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
            container: props.id,
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
  on_edit: (id: number) => void;
};

export const EntityDisplay = (props: EntityDisplayProps) => {
  const [data] = UseFetch(props.id, GetEntity);

  if (!data) return <></>;

  return (
    <d-panel bordered colour="surface">
      <l-row>
        <l-col xs="12" md="6">
          <t-link block href={[props.url_start, props.id].join("/")}>
            {data.name}
          </t-link>
        </l-col>
        <l-col xs="12" md="6">
          <div style={{ textAlign: "center" }}>
            <img
              src={`/entities/${props.id}/image`}
              alt={data.name}
              style={{
                maxHeight: "10rem",
              }}
            />
          </div>
        </l-col>
        <l-col xs="12">
          <f-button type="button" onClick={() => props.on_edit(props.id)}>
            Update
          </f-button>
        </l-col>
      </l-row>
    </d-panel>
  );
};

export const EntityName = (props: { id: number }) => {
  const [data] = UseFetch(props.id, GetEntity);

  return <>{data?.name ?? ""}</>;
};
