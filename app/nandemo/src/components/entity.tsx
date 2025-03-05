import { Assert } from "@ipheion/safe-type";
import { AddEntity, GetEntity } from "api-client";
import { FormSubmittedEvent } from "bakery";
import { CreateEntityModel } from "models/entity";
import { useCallback } from "preact/hooks";
import { UseFetch } from "ui-utils/use-fetch";

type EntityFormProps = {
  id?: number;
  close: () => void;
};

export const EntityForm = (props: EntityFormProps) => {
  return (
    <f-form
      submit="event-only"
      onSubmitted={useCallback(
        (e: FormSubmittedEvent) => {
          const data = e.FormData;
          Assert(CreateEntityModel, data);
          if (!props.id) AddEntity(data).then(() => props.close());
        },
        [props.id]
      )}
    >
      <l-row>
        <l-col xs="12" sm="6" md="7" lg="8" xl="9">
          <f-input name="name">Name</f-input>
        </l-col>
        <l-col xs="12" sm="6" md="5" lg="4" xl="3">
          <f-numeric
            name="quantity"
            prefill={"1"}
            decimal-places="0"
            no-negative
          >
            Quantity
          </f-numeric>
        </l-col>
        <l-col xs="12">
          <f-button type="submit">Create</f-button>
        </l-col>
      </l-row>
    </f-form>
  );
};

type EntityDisplayProps = {
  id: number;
};

export const EntityDisplay = (props: EntityDisplayProps) => {
  const [data] = UseFetch(props.id, GetEntity);

  if (!data) return <></>;

  return (
    <d-panel bordered>
      <l-row>
        <l-col xs="12">{data.name}</l-col>
      </l-row>
    </d-panel>
  );
};
