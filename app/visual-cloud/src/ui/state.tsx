import React from "react";

export type Argument = {
  type_name: string;
  description: string;
};

export type Trace = {
  from: [string, number];
  to: [string, number];
  anchors: Array<[number, number]>;
};

export type ConstructInstance = {
  id: string;
  x: number;
  y: number;
  type: string;
  args: Array<string>;
};

export type ConstructSpec = {
  args: Array<Argument>;
  inlets: Array<Argument>;
  outlets: Array<Argument>;
};

export type AppState = {
  instances: Record<string, ConstructInstance>;
  traces: Record<string, Trace>;
  constructs: Record<string, ConstructSpec>;
};

const AppStateContext = React.createContext<
  [AppState, (state: AppState) => void]
>([{ instances: {}, traces: {}, constructs: {} }, () => {}]);

export function AppStateProvider(
  props: React.PropsWithChildren<{
    state: AppState;
    on_change: (state: AppState) => void;
  }>
) {
  return (
    <AppStateContext.Provider value={[props.state, props.on_change]}>
      {props.children}
    </AppStateContext.Provider>
  );
}

export function UseState() {
  const [state] = React.useContext(AppStateContext);
  return state;
}

export function UseInstance(instance_id: string) {
  const state = UseState();
  const instance = state.instances[instance_id];
  if (!instance)
    throw new Error(`Could not find construct instance ${instance_id}`);
  const spec = state.constructs[instance.type];
  if (!spec)
    throw new Error(`Could not find spec ${instance.type} for ${instance_id}`);

  return { instance, spec };
}

export function UseTrace(instance_id: string) {
  const state = UseState();
  const instance = state.traces[instance_id];
  if (!instance) throw new Error(`Could not find trace ${instance_id}`);
  return instance;
}
