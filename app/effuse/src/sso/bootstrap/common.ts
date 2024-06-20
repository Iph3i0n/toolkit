import { State } from "../server";

export function b<T>(factory: (state: State) => T) {
  let instance: T;

  return (state: State) => {
    if (!instance) instance = factory(state);

    return instance;
  };
}
