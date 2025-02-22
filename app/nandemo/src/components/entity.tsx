import { Assert } from "@ipheion/safe-type";
import { AddEntity } from "api-client";
import { FormSubmittedEvent } from "bakery";
import { CreateEntityModel } from "models/entity";
import { useCallback } from "preact/hooks";

type Props = {
  id?: number;
  close: () => void;
};

export const EntityForm = (props: Props) => {
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
