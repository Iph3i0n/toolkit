import { State } from "state";

export default function c<T>(factory: () => T) {
  let instance: T | undefined = undefined;
  return () => {
    instance = instance ?? factory();
    return instance;
  };
}
