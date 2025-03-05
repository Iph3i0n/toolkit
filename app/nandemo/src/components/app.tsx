import { useCallback, useState } from "preact/hooks";
import { EntityDisplay, EntityForm } from "./entity";
import { UseFetch } from "ui-utils/use-fetch";
import { GetEntities } from "api-client";

export const App = () => {
  const [entities, , , reset] = UseFetch(
    undefined as number | undefined,
    GetEntities
  );

  const [adding, set_adding] = useState(false);

  const finished = useCallback(() => {
    set_adding(false);
    reset();
  }, [set_adding, reset]);

  return (
    <>
      <l-container>
        {entities?.map((e) => (
          <EntityDisplay id={e} />
        ))}
      </l-container>
      <l-container>
        <f-button type="button" onClick={() => set_adding(true)}>
          +
        </f-button>
      </l-container>
      <o-modal open={adding} onCloseRequested={() => set_adding(false)}>
        <span slot="title">Add Entity</span>
        <EntityForm close={finished} />
      </o-modal>
    </>
  );
};
