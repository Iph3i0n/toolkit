import { useState } from "preact/hooks";
import { EntityForm } from "./entity";

export const App = () => {
  const [adding, set_adding] = useState(false);
  return (
    <>
      <l-container>
        <f-button type="button" onClick={() => set_adding(true)}>
          +
        </f-button>
      </l-container>
      <o-modal open={adding} onCloseRequested={() => set_adding(false)}>
        <span slot="title">Add Entity</span>
        <EntityForm close={() => set_adding(false)} />
      </o-modal>
    </>
  );
};
